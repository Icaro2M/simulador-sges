from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.simulations import router as simulations_router
from api.routes.comparisons import router as comparisons_router
from api.routes.sensitivity import router as sensitivity_router
from api.routes.monte_carlo import router as monte_carlo_router
from api.routes.dispatch import router as dispatch_router


app = FastAPI(
    title="SGES Simulator API",
    version="0.1.0",
    description="API para simulações de sistemas SGES."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "SGES Simulator API"
    }


app.include_router(simulations_router)
app.include_router(comparisons_router)
app.include_router(sensitivity_router)
app.include_router(monte_carlo_router)
app.include_router(dispatch_router)