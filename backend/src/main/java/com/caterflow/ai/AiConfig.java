package com.caterflow.ai;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AiConfig {

    @Bean
    @Primary
    AiProvider aiProvider(
        AiProperties properties,
        HeuristicAiProvider heuristic,
        ObjectProvider<ClaudeAiProvider> claudeProvider) {
        if ("claude".equalsIgnoreCase(properties.getProvider())) {
            String key = properties.getClaude().getApiKey();
            ClaudeAiProvider claude = claudeProvider.getIfAvailable();
            if (key != null && !key.isBlank() && claude != null) {
                return claude;
            }
        }
        return heuristic;
    }
}
