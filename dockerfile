FROM denoland/deno:2.0.0

WORKDIR /app

COPY . .

ENV TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>
ENV GROQ_API_KEY=<your-groq-api-key>

RUN deno cache main.ts --allow-import

CMD [ "deno", "run", "bot" ]