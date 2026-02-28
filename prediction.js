document.addEventListener("DOMContentLoaded", function() {

    /* ===============================
       BACKGROUND PARTICLE SYSTEM
    =============================== */

    const canvas = document.getElementById("bgCanvas");

    if (canvas) {

        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;

                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function init() {
            particles = [];
            for (let i = 0; i < 100; i++) {
                particles.push(new Particle());
            }
        }

        function connect() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {

                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.strokeStyle = `rgba(24, 119, 242, ${1 - distance/150})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            connect();
            requestAnimationFrame(animate);
        }

        init();
        animate();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        });
    }


    /* ===============================
       ML PREDICTION SYSTEM
    =============================== */

    const form = document.getElementById("predictionForm");

    if (form) {

        form.addEventListener("submit", async function(e) {

            e.preventDefault();

            // Collect all financial metrics
            const data = {
                // Institution metrics
                total_assets: parseFloat(document.getElementById("total_assets").value),
                leverage_ratio: parseFloat(document.getElementById("leverage_ratio").value),
                liquidity_ratio: parseFloat(document.getElementById("liquidity_ratio").value),
                roe: parseFloat(document.getElementById("roe").value),
                credit_rating: parseFloat(document.getElementById("credit_rating").value),
                stock_price: parseFloat(document.getElementById("stock_price").value),
                cds_spread: parseFloat(document.getElementById("cds_spread").value),
                
                // Network exposure
                total_exposure_given: parseFloat(document.getElementById("total_exposure_given").value),
                total_exposure_received: parseFloat(document.getElementById("total_exposure_received").value),
                num_borrowers: parseFloat(document.getElementById("num_borrowers").value),
                num_lenders: parseFloat(document.getElementById("num_lenders").value),
                avg_debtor_leverage: parseFloat(document.getElementById("avg_debtor_leverage").value),
                
                // Market indicators
                vix_index: parseFloat(document.getElementById("vix_index").value),
                credit_spread: parseFloat(document.getElementById("credit_spread").value),
                yield_curve_slope: parseFloat(document.getElementById("yield_curve_slope").value),
                sp500_return: parseFloat(document.getElementById("sp500_return").value),
                gdp_growth: parseFloat(document.getElementById("gdp_growth").value),
                unemployment_rate: parseFloat(document.getElementById("unemployment_rate").value)
            };

            try {

                const response = await fetch("/predict", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                
                // Check for errors
                if (result.error) {
                    alert("Prediction Error: " + result.error);
                    return;
                }
                
                const probability = result.probability;
                const riskLevel = result.risk_level;
                const topFactors = result.top_risk_factors || [];

                // Display results
                const resultsSection = document.getElementById("resultsSection");
                const percentageValue = document.getElementById("percentageValue");
                const riskLevelDiv = document.getElementById("riskLevel");
                const progressFill = document.getElementById("progressFill");
                const riskFactorsList = document.getElementById("riskFactorsList");
                
                resultsSection.style.display = "flex";
                percentageValue.innerText = probability + "%";
                riskLevelDiv.innerText = "Risk Level: " + riskLevel;
                
                // Set color based on risk level
                if (result.risk_color) {
                    progressFill.style.backgroundColor = result.risk_color;
                }

                setTimeout(() => {
                    progressFill.style.width = probability + "%";
                }, 200);
                
                // Display top risk factors
                if (riskFactorsList && topFactors.length > 0) {
                    riskFactorsList.innerHTML = "";
                    topFactors.forEach(factor => {
                        const li = document.createElement("li");
                        li.innerHTML = `<strong>${factor.factor}</strong>: ${factor.value} (Importance: ${factor.importance}%)`;
                        riskFactorsList.appendChild(li);
                    });
                }

            } catch (error) {
                console.error("Prediction Error:", error);
                alert("Failed to get prediction. Please ensure the model is trained and the server is running.");
            }

        });
    }

});
@media screen and (max-width: 900px) {
    .cards-container {
        gap: 1.5rem;
    }

    .stat-card {
        width: 80%; /* make cards responsive on small screens */
    }
}
