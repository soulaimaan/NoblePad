import tweepy
import time
import openai
import requests
import random

# --- CONFIGURATIE (Vul hier je sleutels in) ---
# X (Twitter) API Keys
API_KEY = "JOUW_TWITTER_API_KEY"
API_SECRET = "JOUW_TWITTER_API_SECRET"
ACCESS_TOKEN = "JOUW_ACCESS_TOKEN"
ACCESS_SECRET = "JOUW_ACCESS_SECRET"
BEARER_TOKEN = "JOUW_BEARER_TOKEN"

# OpenAI API Key (Het Brein)
OPENAI_KEY = "JOUW_OPENAI_API_KEY"

# De launchpad link
LINK = "lordbegrave.eu"

# Initialisatie
client = tweepy.Client(bearer_token=BEARER_TOKEN, consumer_key=API_KEY, consumer_secret=API_SECRET, access_token=ACCESS_TOKEN, access_token_secret=ACCESS_SECRET)
openai.api_key = OPENAI_KEY

# --- LIJST MET DOELWITTEN ---
# Keywords waar mensen klagen over geldverlies
# Keywords where institutional investors or builders are discussing infrastructure
SEARCH_KEYWORDS = ["Institutional DeFi", "Launchpad security", "Web3 infrastructure", "Liquidity locks", "Token launch problems"]

# Influencers die over veiligheid praten (IDs moet je opzoeken, dit zijn voorbeelden)
INFLUENCERS = ["ZachXBT", "CertiK", "PeckShieldAlert", "Coffeezilla"]

# --- HET BREIN (AI FUNCTIE) ---
def generate_smart_reply(tweet_text, author_name):
    """
    Genereert een empathische, technische reactie.
    """
    prompt = f"""
    Je bent een solidaire blockchain developer die NoblePad heeft gebouwd.
    CONTEXT: Een gebruiker ({author_name}) postte dit op X: "{tweet_text}"

    OPDRACHT: Schrijf een korte reactie (max 240 tekens).
    1. Toon eerst medeleven/erkenning van het probleem (rug pulls zijn vreselijk).
    2. Leg heel kort uit hoe NoblePad dit technisch oplost (Milestone Escrow of Kill-Switch).
    3. Verwijs subtiel naar de oplossing: {LINK}

    TOON: Professioneel, technisch, niet commercieel, "developer-to-developer". Gebruik geen hashtags.
    """

    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "system", "content": "You are a helpful Web3 security expert."},
                  {"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

# --- DE OGEN (MONITOR FUNCTIE) ---
def run_bot():
    print("🛡 NoblePad Security Bot is online en scant de blockchain...")

    processed_tweets = set() # Houdt bij waarop al gereageerd is
    while True:
        try:
            # 1. Zoek naar slachtoffers (De "Nachtmerrie" Strategie)
            for keyword in SEARCH_KEYWORDS:
                print(f"Scannen op keyword: {keyword}...")
                tweets = client.search_recent_tweets(query=keyword, max_results=10, tweet_fields=['author_id', 'created_at'])

                if tweets.data:
                    for tweet in tweets.data:
                        if tweet.id not in processed_tweets:
                            # Genereer antwoord
                            reply_text = generate_smart_reply(tweet.text, "CryptoUser")

                            # Plaats reactie (Uncomment de regel hieronder om het echt te posten)
                            # client.create_tweet(text=reply_text, in_reply_to_tweet_id=tweet.id)

                            print(f"✅ GEREAGEERD OP TWEET {tweet.id}: \n--> {reply_text}\n")
                            processed_tweets.add(tweet.id)
                time.sleep(10) # 10 seconden wachten voor de volgende zoekopdracht

        except Exception as e:
            print(f"Er is een fout opgetreden: {e}")
            time.sleep(60) # Wacht een minuut bij een fout

if __name__ == "__main__":
    run_bot()
