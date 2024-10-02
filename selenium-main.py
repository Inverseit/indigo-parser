from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

IIN = "920518451287"
PASSWORD = "Korkem2015&+"
NAME = 'ТОО Детский сад "NURBOTA KZ"'

# Set up the WebDriver (this will open a Chrome browser window)
driver = webdriver.Chrome()

# Step 1: Open the login page
login_page_url = "https://indigo-kargoo.e-orda.kz/ru/cabinet/personal/login"
driver.get(login_page_url)

# Allow time for the page to load
time.sleep(0.5)

# Step 2: Fill in the IIN field
iin_value = IIN
iin_input = driver.find_element(By.ID, "profile-IIN")
iin_input.send_keys(iin_value)

# Step 3: Agree to the terms by clicking the checkboxes
agree_terms = driver.find_element(By.ID, "accessform-registrationagree")
agree_terms.click()

close_banner = driver.find_element(By.ID, "close-banner")
close_banner.click()

agree_data_usage = driver.find_element(By.ID, "accessform-datausageagree")
agree_data_usage.click()

# Step 4: Submit the form (click the "Продолжить" button)
submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
submit_button.click()

# Allow time for the next page to load
time.sleep(0.5)

# Step 5: Fill in the password field on the second form
password_value = PASSWORD
password_input = driver.find_element(By.ID, "secureKey")
password_input.send_keys(password_value)

# Step 6: Submit the password form (click the "Войти" button)
login_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
login_button.click()

# Optionally, wait and observe the results before closing
time.sleep(0.5)

# Step 1: Locate the form by its ID
form = driver.find_element(By.ID, "w1")

# Optionally: You can verify form fields if necessary (these seem pre-filled)
csrf_token = form.find_element(By.NAME, "_csrf-frontend")
iin_value = form.find_element(By.ID, "reserveform-iin")
request_number = form.find_element(By.ID, "reserveform-requestnumber")

# You can print these values for verification if needed
print(csrf_token.get_attribute("value"))
print(iin_value.get_attribute("value"))
print(request_number.get_attribute("value"))

# Step 2: Find the submit button within the form
submit_button = form.find_element(By.CSS_SELECTOR, "button[type='submit']")

# Step 3: Click the submit button to submit the form
submit_button.click()

# Allow time to observe or let the form submit
time.sleep(0.5)

# Step 1: Locate the form by its ID
form = driver.find_element(By.ID, "w0")

# Optionally: You can verify the hidden input values if necessary
csrf_token = form.find_element(By.NAME, "_csrf-frontend")
print("CSRF Token:", csrf_token.get_attribute("value"))

# Step 3: Find the submit button within the form
submit_button = form.find_element(By.CSS_SELECTOR, "button[type='submit']")

# Step 4: Click the submit button to submit the form
submit_button.click()

# Allow time to observe or let the form submit
time.sleep(2)

# Find the search input field
search_input = driver.find_element(By.ID, "search-word")

# Enter the NAME into the search field
search_input.clear()  # Clear any existing text
search_input.send_keys(NAME)
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

wait = WebDriverWait(driver, 10)

try:
    # Find the form
    form = wait.until(EC.presence_of_element_located((By.ID, "w0")))
    # Find the submit button within the form
    submit_button = form.find_element(By.CSS_SELECTOR, "button[type='submit']")
    
    # Click the submit button
    submit_button.click()
    
    print("Form submitted successfully.")
except Exception as e:
    print(f"An error occurred: {str(e)}")

# Wait for the next page to load
time.sleep(0.5)

# Keep the browser open
while True:
    pass

# Close the browser (this line is unreachable due to the infinite loop above)
driver.quit()