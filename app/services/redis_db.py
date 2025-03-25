import redis

class RedisDb:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.redis = redis.Redis(host=host, port=port, db=0)

    def get(self, key):
        return self.redis.get(key)

    def set(self, key, value):
        self.redis.set(key, value)

    def delete(self, key):
        self.redis.delete(key)
