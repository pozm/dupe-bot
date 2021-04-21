import socket
import asyncio
from struct import pack, unpack


class Client(asyncio.Protocol):
    def connection_made(self, transport):
        self.transport = transport
        self.server_transport = None

    def data_received(self, data):
        # print('recv:', repr(data))
        self.server_transport.write(data)

    def connection_lost(self, *args):
        self.server_transport.close()


class Server(asyncio.Protocol):
    INIT, HOST, DATA = 0, 1, 2

    def connection_made(self, transport):
        print('from:', transport.get_extra_info('peername'))
        self.transport = transport
        self.state = self.INIT

    def connection_lost(self, exc):
        self.transport.close()

    def data_received(self, data):
        # print('send:', repr(data))

        if self.state == self.INIT:
            assert data[0] == 0x05
            self.transport.write(pack('!BB', 0x05, 0x00))  # no auth
            self.state = self.HOST

        elif self.state == self.HOST:
            ver, cmd, rsv, atype = data[:4]
            assert ver == 0x05 and cmd == 0x01

            if atype == 3:    # domain
                length = data[4]
                hostname, nxt = data[5:5+length],  5+length
            elif atype == 1:  # ipv4
                hostname, nxt = socket.inet_ntop(socket.AF_INET, data[4:8]), 8
            elif atype == 4:  # ipv6
                hostname, nxt = socket.inet_ntop(socket.AF_INET6, data[4:20]), 20
            port = unpack('!H', data[nxt:nxt+2])[0]

            print('to:', hostname, port)
            asyncio.ensure_future(self.connect(hostname, port))
            self.state = self.DATA

        elif self.state == self.DATA:
            self.client_transport.write(data)

    async def connect(self, hostname, port):
        loop = asyncio.get_event_loop()
        transport, client = \
            await loop.create_connection(Client, hostname, port)
        client.server_transport = self.transport
        self.client_transport = transport
        hostip, port = transport.get_extra_info('sockname')
        host = unpack("!I", socket.inet_aton(hostip))[0]
        self.transport.write(
            pack('!BBBBIH', 0x05, 0x00, 0x00, 0x01, host, port))

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    srv = loop.create_server(Server, 'localhost', 8000)
    loop.run_until_complete(srv)
    loop.run_forever()
