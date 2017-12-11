var x = document.querySelector('meta[name="viewport"]')
if (screen.width < 320) {
    x.setAttribute("content", "width=device-width,initial-scale=0.59");
} else if (screen.width < 380) {
    x.setAttribute("content", "width=device-width,initial-scale=0.63");
} else if (screen.width < 430) {
    x.setAttribute("content", "width=device-width,initial-scale=0.68");
} else if (screen.width < 650) {
    x.setAttribute("content", "width=device-width,initial-scale=0.79");
} else if (screen.width < 770) {
    x.setAttribute("content", "width=device-width,initial-scale=0.90");
} else if (screen.width >= 770) {
    x.setAttribute("content", "width=device-width,initial-scale=1.0");
}
