import os
import logging
import google.generativeai as genai
from typing import List, Optional

class GeminiClient:
    def __init__(self):
        """Initialize Gemini client with API key from environment"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logging.warning("GEMINI_API_KEY not found in environment variables")
            self.client = None
        else:
            genai.configure(api_key=api_key)
            self.client = genai.GenerativeModel('gemini-2.0-flash')
    
    def generate_project_ideas(self, skills: str, interests: str, experience_level: str, project_type: str) -> Optional[List[dict]]:
        """Generate project ideas based on user input"""
        if not self.client:
            logging.error("Gemini client not initialized - missing API key")
            return None
        
        try:
            prompt = self._create_prompt(skills, interests, experience_level, project_type)
            
            response = self.client.generate_content(prompt)
            
            if not response.text:
                logging.error("Empty response from Gemini API")
                return None
            
            # Parse the response and extract project ideas
            ideas = self._parse_response(response.text)
            return ideas
            
        except Exception as e:
            logging.error(f"Error calling Gemini API: {str(e)}")
            return None
    
    def _create_prompt(self, skills: str, interests: str, experience_level: str, project_type: str) -> str:
        """Create a detailed prompt for project idea generation"""
        prompt = f"""
        Generate 5 unique and creative project ideas based on the following user profile:

        Skills: {skills}
        Interests: {interests}
        Experience Level: {experience_level}
        Project Type Preference: {project_type}

        For each project idea, provide:
        1. Project Name
        2. Brief Description (2-3 sentences)
        3. Key Technologies/Tools to use
        4. Estimated Time to Complete
        5. Learning Outcomes
        6. Difficulty Level

        Format your response as a structured list with clear sections for each project.
        Make sure the projects are:
        - Appropriate for the {experience_level} level
        - Relevant to the stated interests and skills
        - Feasible to complete
        - Educational and engaging
        - Focused on {project_type} development

        Present each project in this format:
        
        **Project [Number]: [Project Name]**
        
        **Description:** [Brief description]
        
        **Technologies:** [List of technologies]
        
        **Estimated Time:** [Time estimate]
        
        **Learning Outcomes:** [What they'll learn]
        
        **Difficulty:** [Beginner/Intermediate/Advanced]
        
        ---
        """
        return prompt
    
    def _parse_response(self, response_text: str) -> List[dict]:
        """Parse the Gemini response into structured project ideas"""
        try:
            ideas = []
            projects = response_text.split('**Project')
            
            for i, project in enumerate(projects[1:], 1):  # Skip first empty split
                try:
                    lines = project.strip().split('\n')
                    
                    # Extract project name from first line
                    name_line = lines[0] if lines else ""
                    name = name_line.split(':**')[0].strip() if ':**' in name_line else f"Project {i}"
                    if name.startswith(f'{i}:'):
                        name = name[2:].strip()
                    
                    # Initialize project data
                    project_data = {
                        'name': name,
                        'description': '',
                        'technologies': '',
                        'time': '',
                        'learning': '',
                        'difficulty': ''
                    }
                    
                    # Parse each section
                    current_section = None
                    for line in lines[1:]:
                        line = line.strip()
                        if not line or line == '---':
                            continue
                            
                        if line.startswith('**Description:**'):
                            current_section = 'description'
                            project_data['description'] = line.replace('**Description:**', '').strip()
                        elif line.startswith('**Technologies:**'):
                            current_section = 'technologies'
                            project_data['technologies'] = line.replace('**Technologies:**', '').strip()
                        elif line.startswith('**Estimated Time:**'):
                            current_section = 'time'
                            project_data['time'] = line.replace('**Estimated Time:**', '').strip()
                        elif line.startswith('**Learning Outcomes:**'):
                            current_section = 'learning'
                            project_data['learning'] = line.replace('**Learning Outcomes:**', '').strip()
                        elif line.startswith('**Difficulty:**'):
                            current_section = 'difficulty'
                            project_data['difficulty'] = line.replace('**Difficulty:**', '').strip()
                        elif current_section and not line.startswith('**'):
                            # Continue previous section
                            project_data[current_section] += ' ' + line
                    
                    # Clean up data
                    for key in project_data:
                        project_data[key] = project_data[key].strip()
                    
                    # Only add if we have essential data
                    if project_data['name'] and project_data['description']:
                        ideas.append(project_data)
                        
                except Exception as e:
                    logging.error(f"Error parsing project {i}: {str(e)}")
                    continue
            
            # If parsing failed, create a fallback
            if not ideas:
                ideas = [{
                    'name': 'Custom Project Idea',
                    'description': response_text[:500] + '...' if len(response_text) > 500 else response_text,
                    'technologies': 'Based on your skills',
                    'time': 'Variable',
                    'learning': 'Skill development in your areas of interest',
                    'difficulty': 'Appropriate for your level'
                }]
            
            return ideas[:5]  # Return max 5 ideas
            
        except Exception as e:
            logging.error(f"Error parsing Gemini response: {str(e)}")
            return [{
                'name': 'Generated Project Idea',
                'description': 'A custom project tailored to your skills and interests.',
                'technologies': 'Based on your specified skills',
                'time': 'Variable',
                'learning': 'Skill development and practical experience',
                'difficulty': 'Appropriate for your experience level'
            }]
