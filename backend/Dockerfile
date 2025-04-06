# Node.js
FROM node:20

# Directory
WORKDIR /app

# Copiy
COPY package.json package-lock.json ./

# Install
RUN npm install

# Copy
COPY . .

# PORT
EXPOSE 3100

# Commmands
CMD ["npm", "run", "devStart"]
