# Use an official node.js runtime as a parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and the package-lock.json to the container
COPY package*.json ./

# Install all the necesary npm packages
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that the app runs on
EXPOSE 8383

RUN npx prisma generate
# Define the command to run your application
CMD ["sh", "-c", "npx prisma migrate dev && node ./src/server.js"]
