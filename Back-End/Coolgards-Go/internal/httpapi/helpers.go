package httpapi

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/mail"
	"regexp"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if status == http.StatusNoContent || value == nil { return }
	_ = json.NewEncoder(w).Encode(value)
}
func writeError(w http.ResponseWriter, status int, message string) { writeJSON(w, status, map[string]string{"message": message}) }
func decodeJSON(r *http.Request, dst any) error {
	dec := json.NewDecoder(r.Body)
	if err := dec.Decode(dst); err != nil { return err }
	if err := dec.Decode(&struct{}{}); !errors.Is(err, io.EOF) { return errors.New("request body must contain a single JSON object") }
	return nil
}
func normalizeEmail(v string) string { return strings.ToLower(strings.TrimSpace(v)) }
func validEmail(v string) bool { addr, err := mail.ParseAddress(v); return err == nil && strings.EqualFold(addr.Address, v) }
func objectID(v string) (primitive.ObjectID, error) { id, err := primitive.ObjectIDFromHex(strings.TrimSpace(v)); if err != nil { return primitive.NilObjectID, errors.New("invalid id") }; return id, nil }
func bodyID(body bson.M) (primitive.ObjectID, error) { v, ok := body["_id"]; if !ok { return primitive.NilObjectID, errors.New("_id is required") }; switch id := v.(type) { case string: return objectID(id); case primitive.ObjectID: return id,nil; default: return objectID(fmt.Sprint(id)) } }
func pagination(r *http.Request)(page,size int,skip int64){page=parseInt(r.URL.Query().Get("page"),1);size=parseInt(r.URL.Query().Get("size"),10);if page<1{page=1};if size<1{size=10};if size>100{size=100};return page,size,int64((page-1)*size)}
func parseInt(v string,fallback int)int{n,err:=strconv.Atoi(v);if err!=nil{return fallback};return n}
func regexFilter(value string)bson.M{return bson.M{"$regex":regexp.QuoteMeta(strings.TrimSpace(value)),"$options":"i"}}
func containsString(items []string,wanted string)bool{for _,item:=range items{if item==wanted{return true}};return false}
func listMaps(r *http.Request,collection *mongo.Collection,filter bson.M,projection bson.M,sort bson.D)([]bson.M,int64,error){_,size,skip:=pagination(r);count,err:=collection.CountDocuments(r.Context(),filter);if err!=nil{return nil,0,err};findOptions:=options.Find().SetSkip(skip).SetLimit(int64(size));if len(projection)>0{findOptions.SetProjection(projection)};if len(sort)>0{findOptions.SetSort(sort)};cursor,err:=collection.Find(r.Context(),filter,findOptions);if err!=nil{return nil,0,err};defer cursor.Close(r.Context());var data []bson.M;if err:=cursor.All(r.Context(),&data);err!=nil{return nil,0,err};if data==nil{data=[]bson.M{}};return data,count,nil}
func sanitizeUpdate(body bson.M,allowed map[string]bool)bson.M{set:=bson.M{};for key,value:=range body{if allowed[key]{set[key]=value}};set["updatedAt"]=time.Now().UTC();return set}
func updateByID(r *http.Request,collection *mongo.Collection,id primitive.ObjectID,set bson.M)(bson.M,error){var updated bson.M;err:=collection.FindOneAndUpdate(r.Context(),bson.M{"_id":id},bson.M{"$set":set},options.FindOneAndUpdate().SetReturnDocument(options.After)).Decode(&updated);return updated,err}
func mongoErrorStatus(err error)(int,string){if errors.Is(err,mongo.ErrNoDocuments){return http.StatusNotFound,"resource not found"};if mongo.IsDuplicateKeyError(err){return http.StatusConflict,"resource already exists"};return http.StatusInternalServerError,"internal server error"}
