from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import asyncio
import asyncio
from datetime import time as dtime, timedelta
import datetime
import pytz

site_language = "ru"

def setup():
    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")  # This will start the browser maximized
    # Set up the WebDriver
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def login_till_search(driver, domain, iin, password):
    # Step 1: Open the login page
    login_page_url = f"https://indigo-{domain}.e-orda.kz/{site_language}/cabinet/personal/login"
    print(login_page_url)
    driver.get(login_page_url)

    # Step 2: Wait for the banner to be clickable and close it
    driver.execute_script("document.getElementById('banner-indigo').style.display = 'none';")
    

    wait = WebDriverWait(driver, 10)  # 10 second timeout
    # Step 3: Fill in the IIN field
    iin_input = wait.until(EC.element_to_be_clickable((By.ID, "profile-IIN")))
    iin_input.send_keys(iin)

    # Step 4: Agree to the terms by clicking the checkboxes
    agree_terms = driver.find_element(By.ID, "accessform-registrationagree")
    agree_terms.click()

    agree_data_usage = driver.find_element(By.ID, "accessform-datausageagree")
    agree_data_usage.click()

    # Step 4: Submit the form (click the "Продолжить" button)
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_button.click()

    # Step 6: Wait for the password field to be interactable
    password_input = wait.until(EC.element_to_be_clickable((By.ID, "secureKey")))
    password_input.send_keys(password)

    # Step 7: Submit the password form (click the "Войти" button)
    login_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
    login_button.click()

    # Step 8: Wait for the form to be available and retrieve the CSRF token and other fields
    form = wait.until(EC.presence_of_element_located((By.ID, "w1")))
    
    csrf_token = form.find_element(By.NAME, "_csrf-frontend")
    iin_value = form.find_element(By.ID, "reserveform-iin")
    request_number = form.find_element(By.ID, "reserveform-requestnumber")

    # You can print these values for verification if needed
    print(csrf_token.get_attribute("value"))
    print(iin_value.get_attribute("value"))
    print(request_number.get_attribute("value"))

    # Step 9: Find and click the submit button within the form
    submit_button = form.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_button.click()

    # Step 10: Wait for the next form, verify the CSRF token, and submit the form
    form = wait.until(EC.presence_of_element_located((By.ID, "w0")))
    csrf_token = form.find_element(By.NAME, "_csrf-frontend")
    print("CSRF Token:", csrf_token.get_attribute("value"))

    submit_button = form.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_button.click()
    print("Last form submitted successfully.")
    time.sleep(1)
    # Step 10: Wait for the next form, verify the CSRF token, and submit the form
    form = wait.until(EC.presence_of_element_located((By.ID, "w0")))

    submit_button = form.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_button.click()
    print("Final form submitted successfully.")
    time.sleep(1)


def _run_registration(driver, kindergarten_name):
  # Find the search input field
  wait = WebDriverWait(driver, 20)  # 20 second timeout
  search_input =  wait.until(EC.visibility_of_element_located((By.ID, "search-word")))

  # Enter the NAME into the search field
  search_input.clear()  # Clear any existing text
  search_input.send_keys(kindergarten_name)
  import time

  search_input.send_keys(Keys.RETURN)

  # Wait for the search results to load
  time.sleep(0.5)

  # Find all forms within the search results
  forms = driver.find_elements(By.CSS_SELECTOR, ".free-places-result-block form")

  # Find the first visible form and submit it
  for form in forms:
      if form.is_displayed():
          submit_button = form.find_element(By.CSS_SELECTOR, "button[type='submit']")
          submit_button.click()
          print("Clicked the submit button of the first visible form.")
          break
  else:
      print("No visible forms found.")

  # Wait for the next page to load
  time.sleep(0.5)

  # wait = WebDriverWait(driver, 10)

  # try:
      # Find the form
      # form = wait.until(EC.presence_of_element_located((By.ID, "w0")))
      # Find the submit button within the form
      # submit_button = form.find_element(By.CSS_SELECTOR, "button[type='submit']")
      
      # Click the submit button
      # submit_button.click()
      
      # print("Form submitted successfully.")
  # except Exception as e:
     #  print(f"An error occurred: {str(e)}")

  # Wait for the next page to load
  # time.sleep(0.5)

async def run_scheduled_script(driver, kindergarten_name, should_run_now, hour=6, minute=59, second=59):
    if should_run_now:
        print(f"Executing script at {datetime.datetime.now()}")
        _run_registration(driver, kindergarten_name)
        return

    # Define target time in GMT+5
    target_time = dtime(hour, minute, second)  # Default time 6:59:59 AM
    timezone = pytz.timezone('Etc/GMT-5')  # GMT+5

    print(f"Server UTC time: {datetime.datetime.now(datetime.UTC)}")
    print(f"Server kz_time: {datetime.datetime.now(timezone)}")

    while True:
        kz_time = datetime.datetime.now(timezone)
        target_datetime = datetime.datetime.combine(kz_time.date(), target_time, tzinfo=timezone)
        print(f"Target time: {target_datetime}")
        # Calculate the difference in seconds between now and the target time
        wait_seconds = (target_datetime - kz_time).total_seconds()
        
        print(f"{wait_seconds=}")

        # If target time has passed for today, schedule for the same time tomorrow
        while wait_seconds >= 0:
            kz_time = datetime.datetime.now(timezone)
            wait_seconds = (target_datetime - kz_time).total_seconds()
            # Sleep for the required time or until the next second
            print(f"{wait_seconds=}")
            await asyncio.sleep(min(wait_seconds, 1))

        # Once the wait is over, execute the script
        print(f"Executing script at {datetime.datetime.now(timezone)}")
        _run_registration(driver, kindergarten_name)
        return  # Exit after execution

    
async def run_everything(driver, iin, password, kindergarten_name, region, hour, minute, second, should_run_now = False):
    login_till_search(driver, region, iin, password)
    
    # wait until the specified hours and minutes is reached, astana time morning at 6:59:59
    await run_scheduled_script(driver, kindergarten_name, should_run_now, hour=hour, minute=minute, second=second)