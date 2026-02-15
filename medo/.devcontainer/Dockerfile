FROM mcr.microsoft.com/devcontainers/typescript-node:20

# Install Python, Chromium, and Chromedriver
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive 
    && apt-get -y install --no-install-recommends 
        python3 
        python3-pip 
        python3-venv 
        chromium 
        chromium-driver

# Create a symbolic link for chromedriver if it's not in the expected path
RUN ln -s /usr/bin/chromedriver /usr/local/bin/chromedriver || true

# Install Python packages globally (or in a way that doesn't require a venv for simplicity in this container)
# Note: Newer Debian/Ubuntu might complain about externally managed environments.
# Using --break-system-packages if needed, or just standard pip if it works.
COPY requirements.txt /tmp/pip-tmp/
RUN pip3 install --break-system-packages -r /tmp/pip-tmp/requirements.txt 
    && rm -rf /tmp/pip-tmp
