from daytona import Daytona, DaytonaConfig
  
# Define the configuration
config = DaytonaConfig(api_key="dtn_6356b1b38dcbc5341a40188ad7dbc3f5a6e03565a1522af6967c9dfd8148b3d0")

# Initialize the Daytona client
daytona = Daytona(config)

# Create the Sandbox instance
sandbox = daytona.create()

# Run the code securely inside the Sandbox
response = sandbox.process.code_run('print("Hello World from code!")')
if response.exit_code != 0:
  print(f"Error: {response.exit_code} {response.result}")
else:
    print(response.result)
  