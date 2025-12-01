package middlewares

import (
	"net/http"
	"sync"
	"time"

	"api/internal/utils"
)

// RateLimiter gère la limitation de débit par IP
type RateLimiter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex
	rate     int           // Nombre de requêtes autorisées
	window   time.Duration // Fenêtre de temps
}

type visitor struct {
	lastSeen time.Time
	count    int
}

// NewRateLimiter crée un nouveau rate limiter
// rate: nombre de requêtes autorisées
// window: fenêtre de temps (ex: 1 minute)
func NewRateLimiter(rate int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		rate:     rate,
		window:   window,
	}

	// Nettoyer les visiteurs expirés toutes les minutes
	go rl.cleanupVisitors()

	return rl
}

// cleanupVisitors supprime les visiteurs qui n'ont pas fait de requête depuis la fenêtre
func (rl *RateLimiter) cleanupVisitors() {
	for {
		time.Sleep(rl.window)
		rl.mu.Lock()
		now := time.Now()
		for ip, v := range rl.visitors {
			if now.Sub(v.lastSeen) > rl.window {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// getVisitor récupère ou crée un visiteur pour une IP
func (rl *RateLimiter) getVisitor(ip string) *visitor {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	v, exists := rl.visitors[ip]
	if !exists {
		v = &visitor{
			lastSeen: time.Now(),
			count:    0,
		}
		rl.visitors[ip] = v
		return v
	}

	// Réinitialiser le compteur si la fenêtre est expirée
	if time.Since(v.lastSeen) > rl.window {
		v.count = 0
		v.lastSeen = time.Now()
	}

	return v
}

// Allow vérifie si une requête est autorisée
func (rl *RateLimiter) Allow(ip string) bool {
	v := rl.getVisitor(ip)

	rl.mu.Lock()
	defer rl.mu.Unlock()

	if v.count >= rl.rate {
		return false
	}

	v.count++
	v.lastSeen = time.Now()
	return true
}

// getClientIP extrait l'IP réelle du client
func getClientIP(r *http.Request) string {
	// Vérifier d'abord les headers de proxy (pour les reverse proxies)
	ip := r.Header.Get("X-Forwarded-For")
	if ip != "" {
		return ip
	}

	ip = r.Header.Get("X-Real-Ip")
	if ip != "" {
		return ip
	}

	// Sinon utiliser RemoteAddr
	return r.RemoteAddr
}

// RateLimitMiddleware crée un middleware de rate limiting
// rate: nombre de requêtes autorisées par fenêtre
// window: fenêtre de temps (ex: time.Minute)
func RateLimitMiddleware(rate int, window time.Duration) func(http.Handler) http.Handler {
	limiter := NewRateLimiter(rate, window)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := getClientIP(r)

			if !limiter.Allow(ip) {
				w.Header().Set("Retry-After", window.String())
				utils.RespondError(w, http.StatusTooManyRequests, "Trop de requêtes. Veuillez réessayer plus tard.")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RateLimitByUser crée un middleware de rate limiting par utilisateur (pour les routes authentifiées)
func RateLimitByUser(rate int, window time.Duration) func(http.Handler) http.Handler {
	limiter := NewRateLimiter(rate, window)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Essayer d'obtenir l'ID utilisateur depuis le contexte
			claims, ok := GetUserClaims(r)
			var identifier string

			if ok && claims != nil {
				// Si authentifié, utiliser l'ID utilisateur
				identifier = claims.UserID
			} else {
				// Sinon utiliser l'IP
				identifier = getClientIP(r)
			}

			if !limiter.Allow(identifier) {
				w.Header().Set("Retry-After", window.String())
				utils.RespondError(w, http.StatusTooManyRequests, "Trop de requêtes. Veuillez réessayer plus tard.")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

