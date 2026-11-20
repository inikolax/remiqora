from __future__ import annotations

import unittest
from unittest.mock import AsyncMock, Mock, patch

import httpx

from app.config import RemoteModelEndpoint
from app import remote_engine


class RemoteEngineTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        self.endpoints = patch.dict(
            remote_engine.REMOTE_MODEL_ENDPOINTS,
            {
                "test_model": RemoteModelEndpoint(
                    label="Test Model",
                    url="https://model.example/",
                    token="secret",
                    health_path="ready",
                )
            },
            clear=True,
        )
        self.endpoints.start()

    def tearDown(self) -> None:
        self.endpoints.stop()

    def test_enabled_and_auth_headers_are_model_specific(self) -> None:
        self.assertTrue(remote_engine.enabled("test_model"))
        self.assertFalse(remote_engine.enabled("other_model"))
        self.assertEqual(
            remote_engine.auth_headers("test_model"),
            {"Authorization": "Bearer secret"},
        )
        self.assertEqual(remote_engine.auth_headers("other_model"), {})

    async def test_health_check_uses_configured_endpoint_and_token(self) -> None:
        response = Mock()
        client = AsyncMock()
        client.__aenter__.return_value = client
        client.get.return_value = response

        with patch("app.remote_engine.httpx.AsyncClient", return_value=client) as client_class:
            await remote_engine.check_health("test_model")

        client_class.assert_called_once_with(timeout=5)
        client.get.assert_awaited_once_with(
            "https://model.example/ready",
            headers={"Authorization": "Bearer secret"},
        )
        response.raise_for_status.assert_called_once_with()

    async def test_health_check_reports_the_remote_model(self) -> None:
        response = Mock()
        response.raise_for_status.side_effect = httpx.ConnectError("connection refused")
        client = AsyncMock()
        client.__aenter__.return_value = client
        client.get.return_value = response

        with patch("app.remote_engine.httpx.AsyncClient", return_value=client):
            with self.assertRaisesRegex(
                RuntimeError,
                "Remote Test Model API is unavailable",
            ):
                await remote_engine.check_health("test_model")

    async def test_health_check_rejects_unconfigured_model(self) -> None:
        with self.assertRaisesRegex(
            ValueError,
            "no remote endpoint configured for model 'other_model'",
        ):
            await remote_engine.check_health("other_model")


if __name__ == "__main__":
    unittest.main()
