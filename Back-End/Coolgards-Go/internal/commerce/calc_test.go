package commerce

import "testing"
func TestCalculate(t *testing.T){got:=Calculate([]Line{{Price:10,Quantity:2},{Price:5.5,Quantity:1}},4,20);if got.Items!=3||got.ItemsPrice!=25.5||got.VATPrice!=5.1||got.TotalPrice!=34.6{t.Fatalf("unexpected totals: %+v",got)}}
