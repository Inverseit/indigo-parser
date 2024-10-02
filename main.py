IIN = "920518451287"
PASSWORD = "Korkem2015&+"

import requests
from bs4 import BeautifulSoup


# The URL to the login page
region = "kargoo"
login_page_url = f"https://indigo-{region}.e-orda.kz/ru/cabinet/personal/login"
enter_password_url = f"https://indigo-{region}.e-orda.kz/ru/cabinet/personal/login/check"
list_url = f"https://indigo-{region}.e-orda.kz/kz/cabinet/request/list"
get_url = f"https://indigo-{region}.e-orda.kz/ru/reserv/get"

# Initialize a session
session = requests.Session()


def step_1():
  # Step 1: Get the login page and extract the CSRF token
  response = session.get(login_page_url)
  soup = BeautifulSoup(response.text, 'html.parser')

  # Extract the CSRF token
  csrf_token = soup.find('input', {'name': '_csrf-frontend'})['value']

  # Step 2: Prepare the form data including the dynamically obtained CSRF token and IIN
  form_data = {
      "_csrf-frontend": csrf_token,
      "AccessForm[iin]": IIN,
      "AccessForm[registrationAgree]": "1",  # Agree to terms
      "AccessForm[dataUsageAgree]": "1"      # Agree to data usage
  }

  # Step 3: Submit the form via POST request
  submit_url = login_page_url  # Action URL is the same as the login page URL
  response = session.post(submit_url, data=form_data)

  # Step 4: Check the response for success
  if response.status_code == 200:
      print("Form submitted successfully.")
      # write the response to a file
      with open('iin_entered.html', 'w') as file:
          file.write(response.text)
  else:
      print(f"Form submission failed with status code {response.status_code}.")
      
def step_2():
  with open('iin_entered.html', 'r') as file:
      response = file.read()
  soup = BeautifulSoup(response, 'html.parser')
  # Extract the CSRF token
  csrf_token = soup.find('input', {'name': '_csrf-frontend'})['value']
  fingerprint = soup.find('input', {'name': 'LoginForm[fingerprint]'})['value']
  form_data = {
      "_csrf-frontend": csrf_token,
      "LoginForm[secureKey]": PASSWORD,
      "LoginForm[fingerprint]": fingerprint
  }
  response = session.post(enter_password_url, data=form_data)
  if response.status_code == 200:
      print("Password submitted successfully.")
      # write the response to a file
      with open('password_entered.html', 'w') as file:
          file.write(response.text)
  else:
      print(f"Password submission failed with status code {response.status_code}.")

def step_3():
    # Go to the list URL
    response = session.get(list_url)
    
    # Parse the HTML content
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find the form with id='w1'
    form = soup.find('form', {'id': 'w1'})
    
    if form:
        # Extract the action URL
        action_url = form.get('action')
        
        # Create a dictionary to store the form data
        form_data = {}
        
        # Extract all input fields
        for input_field in form.find_all('input'):
            name = input_field.get('name')
            value = input_field.get('value')
            if name and value:
                form_data[name] = value
        
        # Extract the button text
        button = form.find('button', type='submit')
        if button:
            form_data['button_text'] = button.text.strip()
        
        # Print the extracted data
        print("Extracted form data:")
        for key, value in form_data.items():
            print(f"{key}: {value}")
        
        return form_data, action_url
    else:
        print("Form with id 'w1' not found.")
        return None, None

def step_4(form_data):
    # URL to send the POST request
    url = get_url
    
    # Send POST request
    response = session.post(url, data=form_data)
    
    if response.status_code == 200:
        print("POST request successful.")
        
        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find the form with id='w0'
        form = soup.find('form', {'id': 'w0'})
        
        if form:
            # Create a dictionary to store the form data
            w0_form_data = {}
            
            # Extract all input fields
            for input_field in form.find_all(['input', 'select']):
                name = input_field.get('name')
                if input_field.name == 'select':
                    # For select elements, get the selected option's value
                    selected_option = input_field.find('option', selected=True)
                    value = selected_option['value'] if selected_option else None
                else:
                    value = input_field.get('value')
                
                if name and value:
                    w0_form_data[name] = value
            
            # Print the extracted data
            print("Extracted w0 form data:")
            for key, value in w0_form_data.items():
                print(f"{key}: {value}")
            
            return w0_form_data
        else:
            print("Form with id 'w0' not found.")
            return None
    else:
        print(f"POST request failed with status code {response.status_code}.")
        return None

def step_5(form_data):
    # URL to send the POST request
    url = get_url
    
    # Send POST request
    response = session.post(url, data=form_data)
    
    if response.status_code == 200:
        print(response.text)
    else:
        print(f"POST request failed with status code {response.status_code}.")


step_1()
step_2()
step_3()
form_data_for_step_4, action_url = step_3()
for_step_5 = step_4(form_data_for_step_4)
for_step_6 = step_5(for_step_5)