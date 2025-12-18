FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
# RUN npm install

# Copy the rest of the code
COPY . .

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "dev"]
