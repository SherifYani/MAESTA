"""
Authentication Routes - Admin login/logout
"""
from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from functools import wraps
from models import database

auth_bp = Blueprint('auth', __name__)


def login_required(f):
    """Decorator to require login for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    """Decorator to require admin role.

    Uses the ``is_admin`` flag stored in the session at login time,
    avoiding a redundant DB round-trip on every protected request.
    Falls back to a DB look-up only when the flag is absent (e.g. old
    sessions created before the flag was added).
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login'))

        # Fast path: flag already stored in session
        if 'is_admin' in session:
            if not session['is_admin']:
                flash('Admin access required.', 'danger')
                return redirect(url_for('auth.login'))
            return f(*args, **kwargs)

        # Slow path: legacy session without the flag — do a single DB check
        # and refresh the session so subsequent calls use the fast path.
        user = database.get_user_by_id(session['user_id'])
        if not user or not user.get('is_admin'):
            flash('Admin access required.', 'danger')
            return redirect(url_for('auth.login'))

        session['is_admin'] = bool(user.get('is_admin'))
        return f(*args, **kwargs)
    return decorated_function


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Admin login page"""
    if 'user_id' in session:
        return redirect(url_for('admin.dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        user = database.verify_user(username, password)
        
        if user:
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['is_admin'] = bool(user.get('is_admin'))
            flash('Welcome back!', 'success')
            return redirect(url_for('admin.dashboard'))
        else:
            flash('Invalid username or password.', 'danger')
    
    return render_template('login.html')


@auth_bp.route('/logout')
def logout():
    """Logout and clear session"""
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('auth.login'))
