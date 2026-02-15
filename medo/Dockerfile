# Use the Python Playwright image which includes browsers for Python
FROM mcr.microsoft.com/playwright/python:v1.49.0-jammy

# Install Node.js 20 (Required for Next.js)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY requirements.txt ./

# Install Node dependencies
RUN npm install

# Install Python dependencies
RUN pip3 install -r requirements.txt
RUN playwright install chromium

# Copy source code
COPY . .

# Build the Next.js app
RUN npm run build

# Clean up dev dependencies (optional but good practice)
# RUN npm prune --production

# Expose the port
EXPOSE 3000

# Set hostname to 0.0.0.0 to ensure accessibility
ENV HOSTNAME "0.0.0.0"

# Start the application on the dynamic port (Railway assigns $PORT)
CMD ["sh", "-c", "npm start -- -p ${PORT:-3000}"]
