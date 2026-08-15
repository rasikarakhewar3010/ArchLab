import json
from channels.generic.websocket import AsyncWebsocketConsumer

class DesignConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.design_id = self.scope['url_route']['kwargs']['design_id']
        self.room_group_name = f'design_{self.design_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        
        # We expect a payload like {"type": "canvas_update", "nodes": [...], "edges": [...], "sender_id": "..."}
        # We broadcast it to everyone in the room.

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'design_update',
                'data': data
            }
        )

    # Receive message from room group
    async def design_update(self, event):
        data = event['data']

        # Send message to WebSocket
        await self.send(text_data=json.dumps(data))
