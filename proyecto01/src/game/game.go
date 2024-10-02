package game

import (
	"github.com/Krud3/InteligenciaArtificial/src/utils"

	"github.com/Krud3/InteligenciaArtificial/src/game/entities"
	"github.com/hajimehoshi/ebiten/v2"
)

type Game struct {
	scene     *Scene
	car       *entities.Car
	passenger *entities.Passenger // Optional if the passenger needs independent logic
}

func NewGame() (*Game, error) {
	matrix, err := utils.GetMatrix() // Assuming this loads the matrix
	if err != nil {
		return nil, err
	}

	// Create the scene
	scene := NewScene(matrix)

	// Create the car at its initial position using the scene's car start position
	carPath := [][]int{
		// Sample path or generate it using a search algorithm
	}
	car := entities.NewCar(scene.CarPosX, scene.CarPosY, carPath)

	// Optionally create a passenger if it has independent logic
	passenger := entities.NewPassenger(scene.PassengerPosX, scene.PassengerPosY)

	return &Game{
		scene:     scene,
		car:       car,
		passenger: passenger,
	}, nil
}

func (g *Game) Update() error {
	// Move the car along its path
	g.car.Move()

	// Check if the car reaches the passenger
	if g.car.PosX == g.scene.PassengerPosX && g.car.PosY == g.scene.PassengerPosY {
		// Remove the passenger or handle pickup logic
		g.passenger = nil // Passenger disappears after being picked up
	}

	// Check if the car reaches the goal
	if g.car.PosX == g.scene.GoalPosX && g.car.PosY == g.scene.GoalPosY {
		// Handle reaching the goal (e.g., end the game or display success)
	}

	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
	// Draw the scene first
	g.scene.Draw(screen)

	// Draw the car on top of the scene
	carOp := &ebiten.DrawImageOptions{}
	carOp.GeoM.Translate(float64(g.car.PosX*TileSize), float64(g.car.PosY*TileSize))
	screen.DrawImage(g.scene.Images[Car], carOp)

	// Optionally draw the passenger if it's still present
	if g.passenger != nil {
		passengerOp := &ebiten.DrawImageOptions{}
		passengerOp.GeoM.Translate(float64(g.passenger.PosX*TileSize), float64(g.passenger.PosY*TileSize))
		screen.DrawImage(g.scene.Images[Passenger], passengerOp)
	}
}

func (g *Game) Layout(outsideWidth, outsideHeight int) (screenWidth, screenHeight int) {
	return MaxSize * TileSize, MaxSize * TileSize
}