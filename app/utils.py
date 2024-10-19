from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import asyncio
from datetime import time as dtime, timedelta
import datetime
import pytz

site_language = "ru"

def setup():
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def login_till_search(driver, domain, iin, password, qr=False):
    print(f"login_till_search qr={qr}")
    login_page_url = f"https://indigo-{domain}.e-orda.kz/{site_language}/cabinet/personal/login"
    print(login_page_url)
    driver.get(login_page_url)

    wait = WebDriverWait(driver, 10)

    try:
        driver.execute_script("document.getElementById('banner-indigo').style.display = 'none';")
        driver.execute_script("document.querySelector('.attention-info').style.display = 'none';")
    except:
        print("Banner or attention info not found")

    iin_input = wait.until(EC.element_to_be_clickable((By.ID, "profile-IIN")))
    iin_input.send_keys(iin)

    driver.find_element(By.ID, "accessform-registrationagree").click()
    driver.find_element(By.ID, "accessform-datausageagree").click()
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    
    print("IIN submitted successfully.")

    password_input = wait.until(EC.element_to_be_clickable((By.ID, "secureKey")))
    password_input.send_keys(password)
    
    if qr:
        print("QR code detected, waiting for 5 seconds")
        time.sleep(5)

    wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))).click()

    driver.get(f"https://indigo-{domain}.e-orda.kz/{site_language}/reserv/get")

def _run_registration(driver, kindergarten_name):
    wait = WebDriverWait(driver, 10)
    form = wait.until(EC.presence_of_element_located((By.ID, "w0")))
    csrf_token = form.find_element(By.NAME, "_csrf-frontend")
    print("CSRF Token:", csrf_token.get_attribute("value"))
    form.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    search_input = wait.until(EC.visibility_of_element_located((By.ID, "search-word")))
    search_input.clear()
    search_input.send_keys(kindergarten_name, Keys.RETURN)

    wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".free-places-result-block form")))
    forms = driver.find_elements(By.CSS_SELECTOR, ".free-places-result-block form")

    for form in forms:
        if form.is_displayed():
            form.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
            print("Clicked the submit button of the first visible form.")
            break
    else:
        print("No visible forms found.")

    try:
        wait.until(EC.presence_of_element_located((By.ID, "w0"))).find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        print("Form submitted successfully.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

async def run_scheduled_script(driver, kindergarten_name, should_run_now, hour=6, minute=59, second=59, millisecond=500):
    if should_run_now:
        print(f"Executing script at {datetime.datetime.now()}")
        _run_registration(driver, kindergarten_name)
        return

    timezone = pytz.timezone('Etc/GMT-5')  # GMT+5
    target_time = dtime(hour, minute, second, millisecond * 1000)

    print(f"Server UTC time: {datetime.datetime.now(datetime.UTC)}")
    print(f"Server KZ time: {datetime.datetime.now(timezone)}")

    while True:
        kz_time = datetime.datetime.now(timezone)
        target_datetime = datetime.datetime.combine(kz_time.date(), target_time, tzinfo=timezone)
        print(f"Target time: {target_datetime}")
        wait_seconds = (target_datetime - kz_time).total_seconds()
        
        if wait_seconds < 0:
            target_datetime += timedelta(days=1)
            wait_seconds = (target_datetime - kz_time).total_seconds()

        print(f"Waiting for {wait_seconds} seconds")
        await asyncio.sleep(wait_seconds)

        print(f"Executing script at {datetime.datetime.now(timezone)}")
        _run_registration(driver, kindergarten_name)
        return

async def run_everything(driver, iin, password, kindergarten_name, region, hour, minute, second, millisecond, should_run_now=False, qr=False):
    print(f"qr={qr}")
    login_till_search(driver, region, iin, password, qr=qr)
    await run_scheduled_script(driver, kindergarten_name, should_run_now, hour=hour, minute=minute, second=second, millisecond=millisecond)