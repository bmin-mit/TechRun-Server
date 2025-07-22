export enum NotificationTypeEnum {
  // Normal notifications
  PUBLIC_ANNOUNCEMENT = 'public_announcement',
  PRIVATE_ANNOUNCEMENT = 'private_announcement',

  // Item used (on some team), some items are used only on the team itself
  ITEM_USED = 'item_used',

  // Updates
  COINS_UPDATE = 'coins_update',
  ITEM_UPDATE = 'item_update',

  // Auction notifications
  NEW_AUCTION = 'new_auction',
  // Auction in ... seconds
  TICK_TO_AUCTION = 'tick_to_auction',
  AUCTION_START = 'auction_start',
  AUCTION_TICK = 'auction_tick',
  AUCTION_END = 'auction_end',
  AUCTION_BID = 'auction_bid',
}
