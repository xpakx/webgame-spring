package io.github.xpakx.webrtcgame;

import org.springframework.boot.SpringApplication;

public class TestWebrtcgameApplication {

	public static void main(String[] args) {
		SpringApplication.from(WebrtcgameApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
