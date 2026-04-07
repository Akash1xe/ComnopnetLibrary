from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator

import boto3

from app.core.config import settings


class S3Service:
    def __init__(self) -> None:
        self.client = boto3.client(
            "s3",
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region,
        )

    async def upload_bytes(self, key: str, data: bytes, content_type: str) -> str:
        await asyncio.to_thread(
            self.client.put_object,
            Bucket=settings.aws_s3_bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        return f"https://{settings.aws_s3_bucket}.s3.{settings.aws_region}.amazonaws.com/{key}"
