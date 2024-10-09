from typing import Optional
from selenium.webdriver.chrome.webdriver import WebDriver
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from utils import run_everything, setup
import asyncio
import uvicorn
import socket

# Define the app with the lifespan context
app = FastAPI()

# Assuming your HTML file is in a directory named "static"
app.mount("/static", StaticFiles(directory="static"), name="static")

# Global variable to store the Selenium driver
driver: Optional[WebDriver] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global driver
    yield
    # Clean up the driver on shutdown
    if driver:
        driver.quit()
        print("Driver shut down.")

# Initialize FastAPI with the lifespan handler
app = FastAPI(lifespan=lifespan)

@app.get("/", response_class=HTMLResponse)
async def read_form():
    with open("static/form.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/access")
async def access(
    request: Request,
    iin: str = Form(...),
    password: str = Form(...),
    name: str = Form(...),
    city: str = Form(...),
    hour: int = Form(...),
    minute: int = Form(...),
    second: int = Form(...),
    qr_enabled: bool = Form(...)
):
    global driver
    # always close the driver before starting a new one
    if driver is not None:
        driver.quit()
        print("Driver shut down.")
    driver = setup()

    # Print form data for verification
    print(iin, password, name, city, hour, minute, second, qr_enabled)

    # Run your task with the driver
    await run_everything(driver, iin, password, name, city, hour, minute, second, qr=qr_enabled)

    return {"message": "Form submitted successfully."}

if __name__ == "__main__":
  port = 8000
  while True:
    try:
      uvicorn.run(app, host="0.0.0.0", port=port)
      break
    except socket.error:
      port += 1
