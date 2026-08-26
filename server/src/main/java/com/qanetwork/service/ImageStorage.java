package com.qanetwork.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;

import com.qanetwork.exception.ApiException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * Saves uploaded images under public/images/<subfolder> so they are served
 * statically, enforcing type whitelist and generated filenames.
 */
@Component
public class ImageStorage {

	private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
	private static final long MAX_BYTES = 2 * 1024 * 1024;

	private final Path imagesRoot;

	public ImageStorage(com.qanetwork.config.AppProperties properties) {
		this.imagesRoot = Path.of(properties.imagesDir()).toAbsolutePath().normalize();
	}

	/** Returns the stored filename, or null when no image was uploaded. */
	public String save(MultipartFile file, String subfolder) {
		if (file == null || file.isEmpty()) {
			return null;
		}
		if (!ALLOWED_TYPES.contains(file.getContentType())) {
			throw new ApiException(400, "Only JPEG, PNG, WebP or GIF images are allowed.");
		}
		if (file.getSize() > MAX_BYTES) {
			throw new ApiException(400, "Image exceeds the 2MB limit.");
		}
		try {
			Path destination = imagesRoot.resolve(subfolder);
			Files.createDirectories(destination);
			String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
			String extension = "";
			int dot = original.lastIndexOf('.');
			if (dot >= 0) {
				extension = original.substring(dot).toLowerCase();
			}
			String filename = "image-" + System.currentTimeMillis() + extension;
			file.transferTo(destination.resolve(filename).toFile());
			return filename;
		} catch (IOException error) {
			throw new ApiException(500, "Could not store the uploaded image.");
		}
	}
}
