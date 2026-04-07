from app.services.email_service import EmailService
from app.tasks.celery_app import celery_app


@celery_app.task(name="send_email")
def send_email_task(to_email: str, subject: str, html_content: str) -> None:
    EmailService().send_email_sync(to_email=to_email, subject=subject, html_content=html_content)
