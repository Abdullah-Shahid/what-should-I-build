import os
import logging
from flask import Flask, render_template, request, session, jsonify, redirect, url_for, make_response
from werkzeug.middleware.proxy_fix import ProxyFix
from utils.gemini_client import GeminiClient
from utils.export_utils import generate_pdf, generate_markdown
import json
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "your-secret-key-here")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Initialize Gemini client
gemini_client = GeminiClient()

@app.route('/')
def landing():
    """Landing page"""
    return render_template('landing.html')

@app.route('/index')
def index():
    """Redirect index to landing for compatibility"""
    return redirect(url_for('landing'))

@app.route('/generator')
def generator():
    """Main generator page with form and current ideas"""
    ideas = session.get('current_ideas', [])
    current_idea = session.get('current_idea')
    return render_template('generator.html', ideas=ideas, current_idea=current_idea)

@app.route('/projects')
def projects():
    """Projects page with current ideas and history"""
    ideas = session.get('current_ideas', [])
    current_idea = session.get('current_idea')
    return render_template('projects.html', ideas=ideas, current_idea=current_idea)

@app.route('/generate', methods=['POST'])
def generate_ideas():
    """Generate project ideas based on user input"""
    try:
        # Get form data
        skills = request.form.get('skills', '').strip()
        interests = request.form.get('interests', '').strip()
        experience_level = request.form.get('experience_level', 'beginner')
        project_type = request.form.get('project_type', 'web')
        
        # Validate input
        if not skills or not interests:
            return render_template('generator.html', 
                                 error="Please fill in both skills and interests fields.",
                                 ideas=session.get('current_ideas', []),
                                 current_idea=session.get('current_idea'))
        
        # Generate ideas using Gemini
        ideas = gemini_client.generate_project_ideas(skills, interests, experience_level, project_type)
        
        if not ideas:
            return render_template('generator.html', 
                                 error="Failed to generate ideas. Please try again.",
                                 ideas=session.get('current_ideas', []),
                                 current_idea=session.get('current_idea'))
        
        # Generate meaningful project session name
        def generate_session_name(skills, interests, project_type):
            skill_words = [word.strip() for word in skills.split(',')[:2]]  # Take first 2 skills
            interest_words = [word.strip() for word in interests.split(',')[:1]]  # Take first interest
            type_map = {
                'web': 'Web', 'mobile': 'Mobile', 'desktop': 'Desktop', 
                'data': 'Data', 'game': 'Game', 'api': 'API', 'automation': 'Automation'
            }
            type_name = type_map.get(project_type, project_type.title())
            
            # Combine into meaningful name
            if skill_words and interest_words:
                return f"{type_name} Project: {skill_words[0]} + {interest_words[0]}"
            elif skill_words:
                return f"{type_name} Project: {skill_words[0]}"
            else:
                return f"{type_name} Project Ideas"
        
        session_name = generate_session_name(skills, interests, project_type)
        
        # Store current ideas and add to history
        idea_entry = {
            'id': len(session.get('project_history', [])) + 1,
            'name': session_name,
            'skills': skills,
            'interests': interests,
            'experience_level': experience_level,
            'project_type': project_type,
            'ideas': ideas,
            'timestamp': datetime.now()
        }
        
        # Store current session ideas
        session['current_ideas'] = ideas
        session['current_idea'] = idea_entry
        
        # Add to project history
        project_history = session.get('project_history', [])
        project_history.insert(0, idea_entry)  # Add to beginning
        project_history = project_history[:20]  # Keep last 20 generations
        session['project_history'] = project_history
        
        return render_template('generator.html', 
                             ideas=ideas,
                             current_idea=idea_entry,
                             success="Successfully generated project ideas!")
        
    except Exception as e:
        logging.error(f"Error generating ideas: {str(e)}")
        return render_template('generator.html', 
                             error="An error occurred while generating ideas. Please try again.",
                             ideas=session.get('current_ideas', []),
                             current_idea=session.get('current_idea'))

@app.route('/export/<format_type>/<int:idea_id>')
def export_ideas(format_type, idea_id):
    """Export ideas in specified format"""
    try:
        project_history = session.get('project_history', [])
        idea_entry = None
        
        for idea in project_history:
            if idea['id'] == idea_id:
                idea_entry = idea
                break
        
        if not idea_entry:
            return redirect(url_for('index'))
        
        if format_type == 'pdf':
            pdf_content = generate_pdf(idea_entry)
            response = make_response(pdf_content)
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = f'attachment; filename=project_ideas_{idea_id}.pdf'
            return response
            
        elif format_type == 'markdown':
            md_content = generate_markdown(idea_entry)
            response = make_response(md_content)
            response.headers['Content-Type'] = 'text/markdown'
            response.headers['Content-Disposition'] = f'attachment; filename=project_ideas_{idea_id}.md'
            return response
        
        else:
            return redirect(url_for('index'))
            
    except Exception as e:
        logging.error(f"Error exporting ideas: {str(e)}")
        return redirect(url_for('index'))

@app.route('/clear_history', methods=['POST'])
def clear_history():
    """Clear session history"""
    session['project_history'] = []
    session['current_ideas'] = []
    session['current_idea'] = None
    return redirect(url_for('projects'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
