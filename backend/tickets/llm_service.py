import os
import json
from anthropic import Anthropic
from django.conf import settings


class LLMClassifier:
    """
    Service for classifying support tickets using Anthropic's Claude API.
    
    This service analyzes ticket descriptions and suggests appropriate
    category and priority levels based on content analysis.
    """
    
    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.client = None
        if self.api_key:
            try:
                self.client = Anthropic(api_key=self.api_key)
            except Exception as e:
                print(f"Failed to initialize Anthropic client: {e}")
    
    def classify_ticket(self, description):
        """
        Classify a ticket description and return suggested category and priority.
        
        Args:
            description (str): The ticket description text
            
        Returns:
            dict: Dictionary with 'suggested_category' and 'suggested_priority'
                  Returns default values if classification fails
        """
        # Default fallback values
        default_response = {
            'suggested_category': 'general',
            'suggested_priority': 'medium'
        }
        
        # Check if API key is configured
        if not self.client:
            print("Anthropic API key not configured, using defaults")
            return default_response
        
        # Check if description is valid
        if not description or not description.strip():
            return default_response
        
        try:
            # Craft a detailed prompt for Claude
            prompt = self._build_classification_prompt(description)
            
            # Call Claude API
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=150,
                temperature=0.3,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            # Extract and parse response
            response_text = message.content[0].text.strip()
            result = self._parse_classification_response(response_text)
            
            return result
            
        except Exception as e:
            print(f"LLM classification error: {e}")
            return default_response
    
    def _build_classification_prompt(self, description):
        """
        Build a comprehensive prompt for ticket classification.
        
        This prompt is designed to:
        1. Understand the ticket context
        2. Identify key indicators for category and priority
        3. Return structured, parseable output
        """
        prompt = f"""You are an expert support ticket classifier for a technical support system.

Analyze the following support ticket description and classify it into the appropriate category and priority level.

TICKET DESCRIPTION:
{description}

CLASSIFICATION RULES:

Categories (choose exactly one):
- billing: Payment issues, invoices, refunds, subscription problems, pricing questions
- technical: Bugs, errors, system failures, integration issues, performance problems
- account: Login issues, password resets, profile updates, permissions, access problems
- general: Questions, feature requests, general inquiries, documentation, how-to questions

Priority Levels (choose exactly one):
- critical: System down, data loss, security breach, complete service unavailable, urgent business impact
- high: Major functionality broken, significant user impact, workaround difficult/impossible
- medium: Feature not working as expected, moderate impact, workaround available
- low: Minor issues, cosmetic problems, general questions, feature requests

ANALYSIS GUIDELINES:
1. Look for urgency indicators: "urgent", "asap", "immediately", "down", "broken", "not working"
2. Assess business impact: revenue loss, customer-facing issues, data integrity
3. Consider user frustration level and tone
4. Default to medium priority if unclear

OUTPUT FORMAT:
Respond with ONLY a JSON object in this exact format (no additional text):
{{"category": "category_name", "priority": "priority_level"}}

Examples:
- "Can't login to my account" → {{"category": "account", "priority": "medium"}}
- "Payment failed, urgent!" → {{"category": "billing", "priority": "high"}}
- "System completely down" → {{"category": "technical", "priority": "critical"}}
- "How do I export data?" → {{"category": "general", "priority": "low"}}

Now classify the ticket above:"""
        
        return prompt
    
    def _parse_classification_response(self, response_text):
        """
        Parse the LLM response and extract category and priority.
        
        Args:
            response_text (str): Raw text response from Claude
            
        Returns:
            dict: Parsed category and priority
        """
        try:
            # Try to parse as JSON first
            data = json.loads(response_text)
            
            category = data.get('category', 'general').lower()
            priority = data.get('priority', 'medium').lower()
            
            # Validate category
            valid_categories = ['billing', 'technical', 'account', 'general']
            if category not in valid_categories:
                category = 'general'
            
            # Validate priority
            valid_priorities = ['low', 'medium', 'high', 'critical']
            if priority not in valid_priorities:
                priority = 'medium'
            
            return {
                'suggested_category': category,
                'suggested_priority': priority
            }
            
        except json.JSONDecodeError:
            # Fallback: try to extract from text
            response_lower = response_text.lower()
            
            # Extract category
            category = 'general'
            for cat in ['billing', 'technical', 'account', 'general']:
                if cat in response_lower:
                    category = cat
                    break
            
            # Extract priority
            priority = 'medium'
            for pri in ['critical', 'high', 'medium', 'low']:
                if pri in response_lower:
                    priority = pri
                    break
            
            return {
                'suggested_category': category,
                'suggested_priority': priority
            }


# Singleton instance
llm_classifier = LLMClassifier()
