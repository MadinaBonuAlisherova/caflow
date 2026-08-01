package com.caterflow.ai;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.ai")
public class AiProperties {

    /** heuristic | claude */
    private String provider = "heuristic";

    private Claude claude = new Claude();

    @Data
    public static class Claude {
        private String apiKey = "";
        private String model = "claude-sonnet-4-20250514";
        private int connectTimeoutMs = 5000;
        private int readTimeoutMs = 15000;
    }
}
