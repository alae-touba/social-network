package com.qanetwork.config;

import java.io.IOException;
import java.nio.file.Path;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * Serves uploaded/seeded images from disk and, when the built Angular app is
 * present, hosts it with deep-link fallback to index.html (API mappings take
 * precedence over resource handlers).
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

	private final AppProperties properties;

	public WebConfig(AppProperties properties) {
		this.properties = properties;
	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		String imagesDir = absolute(properties.imagesDir()) + "/";
		registry.addResourceHandler("/images/**")
				.addResourceLocations("file:" + imagesDir)
				.setCachePeriod(86400);

		String spaDir = absolute(properties.spaDir());
		if (new FileSystemResource(spaDir + "/index.html").exists()) {
			registry.addResourceHandler("/**")
					.addResourceLocations("file:" + spaDir + "/")
					.resourceChain(true)
					.addResolver(new PathResourceResolver() {
						@Override
						protected Resource getResource(String resourcePath, Resource location) throws IOException {
							Resource requested = resolveSafely(spaDir, resourcePath);
							if (requested != null) {
								return requested;
							}
							// Deep link: serve the SPA entry point, but only for
							// navigations (same guard as the old Express server).
							if (!acceptsHtml()) {
								return null;
							}
							return new FileSystemResource(spaDir + "/index.html");
						}
					});
		}
	}

	/** Resolves inside the SPA dir only; null for missing or escaping paths. */
	private static Resource resolveSafely(String spaDir, String resourcePath) throws IOException {
		Path root = Path.of(spaDir).normalize();
		Path candidate = root.resolve(resourcePath).normalize();
		if (!candidate.startsWith(root)) {
			return null; // path traversal attempt
		}
		FileSystemResource resource = new FileSystemResource(candidate);
		return resource.exists() && resource.isReadable() ? resource : null;
	}

	private static boolean acceptsHtml() {
		if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
			String accept = attributes.getRequest().getHeader(HttpHeaders.ACCEPT);
			return accept != null && accept.contains("text/html");
		}
		return false;
	}

	private static String absolute(String dir) {
		return Path.of(dir).toAbsolutePath().normalize().toString().replace("\\", "/");
	}
}
