"""
LLM Service for intelligent ticket classification and prioritization.

This module handles integration with LLM APIs (OpenAI) to automatically
suggest categories and priorities for support tickets based on their descriptions.
"""

import logging
import json
from urllib import request, error
from typing import Dict
from django.conf import settings

logger = logging.getLogger(__name__)


class LLMClassifier:
    """
    Intelligent ticket classifier using OpenAI API.
    
    The classifier analyzes ticket descriptions to suggest:
    - Category: billing, technical, account, or general
    - Priority: low, medium, high, or critical
    """
    
    CLASSIFICATION_PROMPT = """You are an expert support ticket classifier. Analyze the following support ticket description and classify it into the appropriate category and priority level.

Ticket Description:
{description}

Categories:
- billing: Issues related to payments, invoices, subscriptions, refunds, pricing
- technical: Technical problems, bugs, errors, software issues, integration problems
- account: Account access, login issues, password resets, account settings, profile updates
- general: Questions, feature requests, feedback, or anything that doesn't fit the above

Priority Levels:
- critical: System down, security breach, data loss, complete service outage, revenue impact
- high: Major functionality broken, significant business impact, many users affected
- medium: Important but not urgent, moderate impact, workarounds available
- low: Minor issues, cosmetic problems, feature requests, general questions

Respond with ONLY a JSON object in this exact format (no markdown, no explanation):
{{"category": "one_of_the_categories", "priority": "one_of_the_priorities"}}

Examples:
Description: "I can't log into my account, tried resetting password but didn't receive email"
Response: {{"category": "account", "priority": "high"}}

Description: "The dashboard is loading very slowly, takes 30+ seconds"
Response: {{"category": "technical", "priority": "medium"}}

Description: "I was charged twice for my subscription this month"
Response: {{"category": "billing", "priority": "high"}}

Description: "How do I export my data?"
Response: {{"category": "general", "priority": "low"}}

Now classify this ticket:
"""

    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.provider = settings.LLM_PROVIDER
        self.model = settings.OPENAI_MODEL
        self.is_configured = bool(self.api_key)
        
        if not self.is_configured:
            logger.warning("LLM API key not configured. Classification will return defaults.")
    
    def classify_ticket(self, description: str) -> Dict[str, str]:
        """
        Classify a ticket description into category and priority.
        
        Args:
            description: The ticket description text
            
        Returns:
            Dictionary with 'suggested_category' and 'suggested_priority'
            Falls back to defaults if LLM is unavailable or fails
        """
        if not self.is_configured:
            logger.info("LLM not configured, using default classification")
            return self._get_default_classification()
        
        if not description or len(description.strip()) < 10:
            logger.info("Description too short for classification, using defaults")
            return self._get_default_classification()
        
        try:
            if self.provider == 'openai':
                return self._classify_with_openai(description)
            else:
                logger.warning(f"Unknown LLM provider: {self.provider}")
                return self._get_default_classification()
                
        except Exception as e:
            logger.error(f"LLM classification failed: {str(e)}", exc_info=True)
            return self._get_default_classification()
    
    def _classify_with_openai(self, description: str) -> Dict[str, str]:
        """
        Use OpenAI Chat Completions API for classification.
        """
        try:
            prompt = self.CLASSIFICATION_PROMPT.format(description=description)

            payload = json.dumps({
                "model": self.model,
                "temperature": 0,
                "max_tokens": 200,
                "messages": [
                    {"role": "system", "content": "You are a strict JSON classifier."},
                    {"role": "user", "content": prompt},
                ],
                "response_format": {"type": "json_object"},
            }).encode("utf-8")

            req = request.Request(
                url="https://api.openai.com/v1/chat/completions",
                data=payload,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}",
                },
                method="POST",
            )
            with request.urlopen(req, timeout=20) as resp:
                response_data = json.loads(resp.read().decode("utf-8"))

            response_text = response_data["choices"][0]["message"]["content"].strip()
            logger.info(f"LLM raw response: {response_text}")

            result = json.loads(response_text)
            
            # Validate and return
            category = result.get('category', 'general')
            priority = result.get('priority', 'medium')
            
            # Validate categories and priorities
            valid_categories = ['billing', 'technical', 'account', 'general']
            valid_priorities = ['low', 'medium', 'high', 'critical']
            
            if category not in valid_categories:
                logger.warning(f"Invalid category from LLM: {category}, using 'general'")
                category = 'general'
            
            if priority not in valid_priorities:
                logger.warning(f"Invalid priority from LLM: {priority}, using 'medium'")
                priority = 'medium'
            
            logger.info(f"Successfully classified: category={category}, priority={priority}")
            
            return {
                'suggested_category': category,
                'suggested_priority': priority
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM JSON response: {e}")
            return self._get_default_classification()
        except error.HTTPError as e:
            body = e.read().decode("utf-8", errors="ignore")
            logger.error(f"OpenAI HTTP error: {e.code} {body}")
            return self._get_default_classification()
        except error.URLError as e:
            logger.error(f"OpenAI network error: {e}")
            return self._get_default_classification()
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}", exc_info=True)
            return self._get_default_classification()
    
    def _get_default_classification(self) -> Dict[str, str]:
        """
        Return sensible defaults when LLM is unavailable.
        """
        return {
            'suggested_category': 'general',
            'suggested_priority': 'medium'
        }


# Singleton instance
_classifier_instance = None

def get_classifier() -> LLMClassifier:
    """Get or create the LLM classifier singleton."""
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = LLMClassifier()
    return _classifier_instance
