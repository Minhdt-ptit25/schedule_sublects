FROM node:20-slim

# Install Python3 and python-calamine for fast Excel parsing
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*
RUN pip3 install --break-system-packages python-calamine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["sh", "-c", "python3 parse_excel.py && node server.js"]
