package commerce

import "math"

type Line struct { Price float64; Quantity int }
type Totals struct { Items int `json:"totalItems"`; ItemsPrice float64 `json:"totalItemsPrice"`; ShipmentPrice float64 `json:"totalShipmentPrice"`; VATPrice float64 `json:"totalVatPrice"`; TotalPrice float64 `json:"totalPrice"` }
func Calculate(lines []Line, shipmentPrice, vatPercent float64) Totals { var items int;var subtotal float64;for _,line:=range lines{if line.Quantity<0{continue};items+=line.Quantity;subtotal+=line.Price*float64(line.Quantity)};subtotal=money(subtotal);vat:=money(subtotal*vatPercent/100);shipmentPrice=money(shipmentPrice);return Totals{Items:items,ItemsPrice:subtotal,ShipmentPrice:shipmentPrice,VATPrice:vat,TotalPrice:money(subtotal+vat+shipmentPrice)} }
func money(v float64)float64{return math.Round((v+1e-9)*100)/100}
