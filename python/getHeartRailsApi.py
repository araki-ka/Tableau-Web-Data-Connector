#!/usr/bin/python
# -*- coding: utf-8 -*-

import requests
import json


def get_line_list(prefecture):
    api = "http://express.heartrails.com/api/json?method=getLines&prefecture=" + prefecture
    res = requests.get(api)
    data = json.loads(res.text)
    # print(data["response"]["line"])
    return data["response"]["line"]


def get_station_list(line_name):
    api = "http://express.heartrails.com/api/json?method=getStations&line=" + line_name
    res = requests.get(api)
    data = json.loads(res.text)
    # print(data["response"]["station"])
    return data["response"]["station"]


print(get_line_list("東京都"))
# print(get_station_list("JR山手線"))


# hoge = get_station_list("JR山手線")
# huge = get_station_list("JR中央本線")
# print(hoge + huge)
