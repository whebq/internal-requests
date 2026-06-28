from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./requests.db"
    secret_key: str = "change-me-in-production"
    admin_username: str = "admin"
    admin_password: str = "admin"
    access_token_expire_minutes: int = 480


settings = Settings()
