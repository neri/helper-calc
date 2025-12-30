export function estimateLoans(points: number, hours: number): { min: number, max: number } {
    if (points < 0 || hours < 0) {
        throw new Error('Invalid input: points and hours must be non-negative');
    }

    const minMinutes = hours * 60;
    const maxMinutes = hours * 60 + 59;

    const pointsFromTimeMin = minMinutes * 20;
    const pointsFromTimeMax = maxMinutes * 20;

    const loanPoints = 50000;

    // Min loans: when time points are max, loan points are min
    const minLoans = Math.max(0, Math.floor((points - pointsFromTimeMax) / loanPoints));

    // Max loans: when time points are min, loan points are max
    const maxLoans = Math.max(0, Math.floor((points - pointsFromTimeMin) / loanPoints));

    return { min: minLoans, max: maxLoans };
}