from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from app.core.config import settings


class EmailService:
    def __init__(self) -> None:
        self.client = SendGridAPIClient(settings.sendgrid_api_key)

    async def send_email(self, to_email: str, subject: str, html_content: str) -> None:
        self.send_email_sync(to_email=to_email, subject=subject, html_content=html_content)

    def send_email_sync(self, to_email: str, subject: str, html_content: str) -> None:
        message = Mail(
            from_email=(str(settings.from_email), settings.from_name),
            to_emails=to_email,
            subject=subject,
            html_content=html_content,
        )
        self.client.send(message)
