package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Session struct {
	TokenHash string    `bson:"tokenHash" json:"-"`
	UserAgent string    `bson:"userAgent,omitempty" json:"-"`
	CreatedAt time.Time `bson:"createdAt" json:"-"`
}

type User struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	FullName       string             `bson:"fullName,omitempty" json:"fullName,omitempty"`
	Email          string             `bson:"email" json:"email"`
	Roles          []string           `bson:"roles" json:"roles"`
	Password       string             `bson:"password" json:"-"`
	Sessions       []Session          `bson:"sessions,omitempty" json:"-"`
	Country        string             `bson:"country,omitempty" json:"country,omitempty"`
	City           string             `bson:"city,omitempty" json:"city,omitempty"`
	Address        string             `bson:"address,omitempty" json:"address,omitempty"`
	PostalCode     string             `bson:"postalCode,omitempty" json:"postalCode,omitempty"`
	MobilePhone    string             `bson:"mobilePhone,omitempty" json:"mobilePhone,omitempty"`
	ResetCodeHash  string             `bson:"resetCodeHash,omitempty" json:"-"`
	ResetExpiresAt *time.Time         `bson:"resetExpiresAt,omitempty" json:"-"`
	CreatedAt      time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type Product struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Title     string             `bson:"title" json:"title"`
	Slug      string             `bson:"slug" json:"slug"`
	Content   string             `bson:"content" json:"content"`
	ImageURLs []string           `bson:"imageUrls" json:"imageUrls"`
	Status    string             `bson:"status" json:"status"`
	Tags      []string           `bson:"tags,omitempty" json:"tags,omitempty"`
	Price     float64            `bson:"price" json:"price"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type Post struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Title      string             `bson:"title" json:"title"`
	Slug       string             `bson:"slug" json:"slug"`
	ImageURL   string             `bson:"imageUrl" json:"imageUrl"`
	Content    string             `bson:"content" json:"content"`
	Tags       []string           `bson:"tags,omitempty" json:"tags,omitempty"`
	WriterID   string             `bson:"writerId" json:"writerId"`
	WriterName string             `bson:"writerName" json:"writerName"`
	Status     string             `bson:"status" json:"status"`
	CreatedAt  time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt  time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type Shipment struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Country       string             `bson:"country" json:"country"`
	ShipmentPrice float64            `bson:"shipmentPrice" json:"shipmentPrice"`
	VAT           float64            `bson:"vat" json:"vat"`
	CreatedAt     time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt     time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type Message struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name      string             `bson:"name,omitempty" json:"name,omitempty"`
	Email     string             `bson:"email" json:"email"`
	Phone     string             `bson:"phone,omitempty" json:"phone,omitempty"`
	Subject   string             `bson:"subject" json:"subject"`
	Content   string             `bson:"content" json:"content"`
	Status    string             `bson:"status" json:"status"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type OrderItem struct {
	ID        primitive.ObjectID `bson:"_id" json:"_id"`
	Quantity  int                `bson:"quantity" json:"quantity"`
	Price     float64            `bson:"price" json:"price"`
	Slug      string             `bson:"slug" json:"slug"`
	Title     string             `bson:"title" json:"title"`
	ImageURLs []string           `bson:"imageUrls" json:"imageUrls"`
}

type OrderAddress struct {
	FullName    string `bson:"fullName" json:"fullName"`
	Country     string `bson:"country" json:"country"`
	City        string `bson:"city" json:"city"`
	Address     string `bson:"address" json:"address"`
	PostalCode  string `bson:"postalCode" json:"postalCode"`
	MobilePhone string `bson:"mobilePhone,omitempty" json:"mobilePhone,omitempty"`
}

type Order struct {
	ID                 primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Cart               []OrderItem        `bson:"cart" json:"cart"`
	UserEmail          string             `bson:"userEmail" json:"userEmail"`
	Status             string             `bson:"status" json:"status"`
	TotalItems         int                `bson:"totalItems" json:"totalItems"`
	TotalItemsPrice    float64            `bson:"totalItemsPrice" json:"totalItemsPrice"`
	TotalShipmentPrice float64            `bson:"totalShipmentPrice" json:"totalShipmentPrice"`
	TotalVATPrice      float64            `bson:"totalVatPrice" json:"totalVatPrice"`
	TotalPrice         float64            `bson:"totalPrice" json:"totalPrice"`
	Address            OrderAddress       `bson:"address" json:"address"`
	PayPalID           string             `bson:"paypalId,omitempty" json:"paypalId,omitempty"`
	TransactionInfo    any                `bson:"transactionInfo,omitempty" json:"transactionInfo,omitempty"`
	CreatedAt          time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt          time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type FileRecord struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name      string             `bson:"name,omitempty" json:"name,omitempty"`
	Encoding  string             `bson:"encoding,omitempty" json:"encoding,omitempty"`
	MIMEType  string             `bson:"mimetype,omitempty" json:"mimetype,omitempty"`
	Path      string             `bson:"path" json:"path"`
	Size      int64              `bson:"size" json:"size"`
	Category  string             `bson:"category,omitempty" json:"category,omitempty"`
	User      string             `bson:"user,omitempty" json:"user,omitempty"`
	Order     string             `bson:"order,omitempty" json:"order,omitempty"`
	Product   string             `bson:"product,omitempty" json:"product,omitempty"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}
