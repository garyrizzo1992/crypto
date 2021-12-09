from py3cw.request import Py3CW
from dotenv import load_dotenv
import json
import os
import urllib3


# load env files
load_dotenv()
#####################
# test run only? #
#####################
test_run = 'no'
#####################
# bot configuration #
#####################
account_name = 'Paper Account 178145'  # your account name
bot_name = 'Paper_DCA_Bot'  # your bot name
# 3commas ID of the bot you want to auto calculate the Base and Safety orders - get it from the bot url (https://3commas.io/bots/xxxxxxx/edit)
bot_id = 'xxxxxxx'
bot_take_profit = '1.5'
bot_trailing_enabled = False
bot_trailing_deviation = '0.5'
bot_max_safety_orders_count = 25
bot_max_active_deals = 2
bot_active_safety_orders_count = 1
# bot_pairs = ['USDT_AAVE', 'USDT_AKRO']  # list your pairs here
bot_safety_order_size = int(2)
bot_strategy_list = [{'options': {'time': 'cumulative', 'type': 'buy_or_strong_buy'}, 'strategy': 'trading_view'}, {'options': {'time': '4h', 'points': '87'}, 'strategy': 'rsi'}, {'options': {'time': '3m', 'points': '70'},
                                                                                                                                                                                    'strategy': 'rsi'}, {'options': {'time': '1h', 'type': 'strong_buy'}, 'strategy': 'trading_view'}, {'options': {'time': '15m', 'type': 'strong_buy'}, 'strategy': 'trading_view'}]  # list your strategy here
bot_martingale_volume_coefficient = '2'
bot_martingale_step_coefficient = '1.4'
bot_safety_order_step_percentage = '2'
bot_take_profit_type = 'total'
###################################
# init python wrapper for 3commas #
###################################
p3cw = Py3CW(
    key=os.getenv('api'),
    secret=os.getenv('secret'),
    request_options={
        'request_timeout': 10,
        'nr_of_retries': 1,
        'retry_status_codes': [502]
    }
)
######################
# get account        #
######################
error, data_accounts = p3cw.request(
    entity='accounts',
    action='',
    additional_headers={'Forced-Mode': 'paper'}
)

for datapoint_account in data_accounts:
    if datapoint_account['name'] == account_name:
        account_balance = round(float(datapoint_account['usd_amount']), 2)
        account_id = str(datapoint_account['id'])
        if account_balance > 0:
            pass
        else:
            exit("Bad account information, balance = 0")
######################
# get market pairs   #
######################
error, market_pairs = p3cw.request(
    entity='accounts',
    action='market_pairs',
    payload={
        'market_code': 'binance',
    },
    additional_headers={'Forced-Mode': 'paper'}
)

# p3cw.request
# error, data_bots = p3cw.request(
#     entity='bots',
#     action=''
# )

######################
# lunar crush        #
######################
url = "https://api.lunarcrush.com/v2?data=market&key=" + \
    str(os.getenv('lunar')) + "&limit=40&sort=ar&desc=true&type=fast"
url_coin_value = "https://api.lunarcrush.com/v2?data=assets&key=" + \
    str(os.getenv('lunar')) + "&page=0"

# assets = json.loads(urllib3.request.urlopen(url).read())
http = urllib3.PoolManager()
resp = http.request("GET", url)
json_d = json.loads(resp.data.decode('utf-8'))

_coins = []
bot_pairs = []
for coins in json_d["data"]:
    _coins.append({
        "s": coins["s"],
        "as": coins["as"],
        "gs": coins["gs"]
    })
resp = http.request("GET", url_coin_value+"&symbol="+",".join(_coins["s"]))
json_d = json.loads(resp.data.decode('utf-8'))
for coins in _coins:
    if ("BTC_"+coins["s"] in market_pairs and coins["as"] > 4 and coins["gs"] > 70):
        print(coins["s"] + " is in list with marketcap: " + str(coins["market_cap"]) +
              ", Average Sentiment: " + str(coins["as"]) + ", Galaxy Score:" + str(coins["gs"]))
        bot_pairs.append("BTC_"+coins["symbol"])

#####################
# auto calculation #
#####################
print("----------START-----------")
print(bot_pairs)
print(account_id)
error, update_bot = p3cw.request(
    entity='bots',
    action='update',
    action_id='7139558',
    payload={
        'account_id': account_id,
        'bot_id': 7139558,
        'name': bot_name,
        'pairs': bot_pairs,
        'base_order_volume': 0.00035,  # this is auto calculated value that we're changing
        'safety_order_volume': 0.00035,  # this is auto calculated value that we're changing
        'take_profit': bot_take_profit,
        'martingale_volume_coefficient': bot_martingale_volume_coefficient,
        'martingale_step_coefficient': bot_martingale_step_coefficient,
        'max_safety_orders': bot_max_safety_orders_count,
        'active_safety_orders_count': bot_active_safety_orders_count,
        'safety_order_step_percentage': bot_safety_order_step_percentage,
        'take_profit_type': bot_take_profit_type,
        'strategy_list': bot_strategy_list,
        'max_active_deals': str(len(bot_pairs)),
        'trailing_enabled': bot_trailing_enabled,
        'trailing_deviation': bot_trailing_deviation
    }
)
if error == {}:
    print("Bot update completed!")
else:
    print(error)
    print("Bot update NOT completed!")


# error, update_bot = p3cw.request(
#     entity='bots',
#     action='show',
#     action_id='7139558',
#     payload={
#         'bot_id': 7139558
#     }
# )
# if error == {}:
#     print(update_bot)
# else:
#     print(error)
#     print("Bot update NOT completed!")
