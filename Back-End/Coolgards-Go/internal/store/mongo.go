package store

import (
	"context"
	"errors"
	"strings"
	"time"
	"github.com/Sina-33/coolgards-fullstack-golang/backend/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)
type Store struct{Client *mongo.Client;DB *mongo.Database}
func Connect(ctx context.Context,uri,dbName string)(*Store,error){client,err:=mongo.Connect(ctx,options.Client().ApplyURI(uri).SetServerSelectionTimeout(5*time.Second));if err!=nil{return nil,err};if err:=client.Ping(ctx,readpref.Primary());err!=nil{_=client.Disconnect(context.Background());return nil,err};return &Store{Client:client,DB:client.Database(dbName)},nil}
func(s *Store)Close(ctx context.Context)error{return s.Client.Disconnect(ctx)}
func(s *Store)Ping(ctx context.Context)error{return s.Client.Ping(ctx,readpref.Primary())}
func(s *Store)EnsureIndexes(ctx context.Context)error{indexes:=map[string][]mongo.IndexModel{"users":{{Keys:bson.D{{Key:"email",Value:1}},Options:options.Index().SetUnique(true).SetName("uniq_email")},{Keys:bson.D{{Key:"sessions.tokenHash",Value:1}},Options:options.Index().SetSparse(true).SetName("session_hash")}},"products":{{Keys:bson.D{{Key:"slug",Value:1}},Options:options.Index().SetUnique(true).SetName("uniq_slug")},{Keys:bson.D{{Key:"title",Value:"text"}},Options:options.Index().SetName("product_title_text")}},"posts":{{Keys:bson.D{{Key:"slug",Value:1}},Options:options.Index().SetUnique(true).SetName("uniq_slug")},{Keys:bson.D{{Key:"status",Value:1},{Key:"createdAt",Value:-1}},Options:options.Index().SetName("post_status_created")}},"orders":{{Keys:bson.D{{Key:"status",Value:1},{Key:"createdAt",Value:-1}},Options:options.Index().SetName("order_status_created")},{Keys:bson.D{{Key:"paypalId",Value:1}},Options:options.Index().SetSparse(true).SetName("paypal_id")}},"messages":{{Keys:bson.D{{Key:"createdAt",Value:-1}},Options:options.Index().SetName("message_created")}}};for collection,models:=range indexes{if _,err:=s.DB.Collection(collection).Indexes().CreateMany(ctx,models);err!=nil{return err}};return nil}
func(s *Store)EnsureAdmin(ctx context.Context,email,fullName,passwordHash string)error{email=strings.ToLower(strings.TrimSpace(email));if email==""||passwordHash==""{return nil};users:=s.DB.Collection("users");var existing domain.User;err:=users.FindOne(ctx,bson.M{"email":email}).Decode(&existing);now:=time.Now().UTC();if err==nil{roles:=existing.Roles;if !contains(roles,"admin"){roles=append(roles,"admin")};_,err=users.UpdateByID(ctx,existing.ID,bson.M{"$set":bson.M{"roles":roles,"updatedAt":now}});return err};if !errors.Is(err,mongo.ErrNoDocuments){return err};admin:=domain.User{ID:primitive.NewObjectID(),FullName:fullName,Email:email,Roles:[]string{"admin"},Password:passwordHash,CreatedAt:now,UpdatedAt:now};_,err=users.InsertOne(ctx,admin);return err}
func contains(items []string,target string)bool{for _,item:=range items{if item==target{return true}};return false}
