import ollama 
def get_embed(text):
    response = ollama.embed(model = "nomic-embed-text", input = text )
    return response["embeddings"]