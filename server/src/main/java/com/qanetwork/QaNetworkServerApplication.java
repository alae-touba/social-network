package com.qanetwork;

import com.qanetwork.config.AppProperties;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class QaNetworkServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(QaNetworkServerApplication.class, args);
	}

}
