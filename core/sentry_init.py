"""
Sentry Initialization - Centralized error tracking
"""
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
import config

def init_sentry(app=None):
    """Initialize Sentry for error tracking"""
    if not config.ENABLE_SENTRY or not config.SENTRY_DSN:
        return
        
    sentry_sdk.init(
        dsn=config.SENTRY_DSN,
        integrations=[FlaskIntegration()] if app else [],
        # Set traces_sample_rate to 1.0 to capture 100%
        # of transactions for performance monitoring.
        traces_sample_rate=1.0,
        # Set profiles_sample_rate to 1.0 to profile 100%
        # of transactions.
        profiles_sample_rate=1.0,
        environment=config.FLASK_ENV,
    )
