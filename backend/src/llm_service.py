import os
import google.generativeai as genai
import json
import re

class LLMService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        self.model = None
        
        if not api_key:
            print("Warning: GEMINI_API_KEY not found in env. LLM services are disabled.")
        else:
            try:
                # Use the recommended model for general tasks
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel("gemini-2.0-flash") 
                print("LLMService initialized successfully.")
            except Exception as e:
                print(f"Error configuring Google Generative AI: {e}. LLM services are disabled.")

    def parse_query(self, user_text):
        """
        Extracts the target concept from the user's question.
        """
        if not self.model:
            return {"concept": None}
            
        prompt = f"""
        You are a helper for a MeTTa programming language documentation bot.
        Extract the main concept the user is asking about.
        Return a JSON object with a single key "concept".
        
        Rules:
        - If the user asks about a function (e.g., "match", "unify"), return that function name.
        - If the user asks about a type (e.g., "Atom", "Symbol"), return that type name.
        - Capitalize concepts like "Atom", "Symbol", "Expression", "Variable" properly as they appear in documentation.
        - Lowercase functions like "match", "unify".
        
        Examples:
        "What is the match function?" -> {{"concept": "match"}}
        "Explain Atoms" -> {{"concept": "Atom"}}
        "How do I use variables?" -> {{"concept": "Variable"}}
        
        User Question: {user_text}
        """
        
        try:
            # Remove strict config to avoid API errors on some models/versions
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            # Robust JSON extraction (like metta-demo)
            # Find the first '{' and the last '}'
            start_idx = text.find("{")
            end_idx = text.rfind("}")
            
            if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
                json_str = text[start_idx:end_idx+1]
                return json.loads(json_str)
            else:
                print(f"LLM Parse Warning: No JSON found in response: {text}")
                return {"concept": None}
                
        except Exception as e:
            print(f"LLM Parse Error: {e}")
            return {"concept": None}

    def generate_response(self, user_text, context):
        """
        Generates a natural language answer based on the retrieved context.
        """
        if not self.model:
            return "LLM service is unavailable due to configuration error."
            
        prompt = f"""
        You are a helpful assistant for the MeTTa programming language.
        
        User Question: "{user_text}"
        
        Information retrieved from Knowledge Base:
        Concept: {context.get('concept')}
        Description: {context.get('description')}
        Syntax/Example: {context.get('syntax')}
        Related Concepts: {', '.join(context.get('related', []))}
        Inferred Relationships: {context.get('inferred_relations', 'None')}
        
        Instructions:
        - Answer the user's question using the provided Description, Syntax, and Example.
        - If the Description is "Not found", politely say you don't have information on that specific concept yet.
        - Always include the 'Inferred Relationships' to give a complete hierarchical context.
        - Provide code examples if the syntax is available.
        - Keep it concise and friendly.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating response: {e}"
