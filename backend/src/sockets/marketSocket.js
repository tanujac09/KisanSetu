// Wires up Socket.IO for the live-bidding rooms. Each auction gets its own
// room ("auction_<id>") so bid/end/finalize events only reach clients who
// are actually watching that auction.
export function registerMarketSocket(io) {
  io.on('connection', (socket) => {
    socket.on('joinAuction', (auctionId) => {
      if (auctionId) socket.join(`auction_${auctionId}`);
    });
    socket.on('leaveAuction', (auctionId) => {
      if (auctionId) socket.leave(`auction_${auctionId}`);
    });
  });
}
