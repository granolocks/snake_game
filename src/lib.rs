use wasm_bindgen::prelude::*;
use wee_alloc::WeeAlloc;

// Use `wee_alloc` as the global allocator.
#[global_allocator]
static ALLOC: WeeAlloc = WeeAlloc::INIT;

#[wasm_bindgen(module = "/www/utils/random.js")]
extern "C" {
  fn rand(max: usize) -> usize;
}

#[wasm_bindgen]
pub enum Direction {
    Up,
    Right,
    Down,
    Left,
}

#[derive(Clone, Copy)]
pub struct SnakeCell(usize);

struct Snake {
    body: Vec<SnakeCell>,
    direction: Direction,
}

impl Snake {
    pub fn new(spawn_point: usize, size: usize) -> Snake {
        let mut body = vec![];

        for i in 0..size {
            body.push(SnakeCell(spawn_point - i));
        }

        Snake {
            body,
            direction: Direction::Down,
        }
    }
}

#[wasm_bindgen]
pub struct World {
    width: usize,
    size: usize,
    snake: Snake,
    next_cell: Option<SnakeCell>,
    reward_cell: usize,
}

#[wasm_bindgen]
impl World {
    pub fn new(width: usize, spawn_idx: usize) -> World {
        let size = width * width;
        let reward_cell  = rand(size);

        World {
            width,
            size,
            snake: Snake::new(spawn_idx, 3),
            next_cell: None,
            reward_cell,
        }
    }

    pub fn reward_cell(&self) -> usize {
        self.reward_cell
    }

    pub fn step(&mut self) {
        let tmp = self.snake.body.clone();
        let len = self.snake_length();

        match self.next_cell {
            Some(cell) => {
                self.snake.body[0] = cell;
                self.next_cell = None;
            }
            None => self.snake.body[0] = self.get_next_cell(&self.snake.direction),
        };

        for i in 1..len {
            self.snake.body[i] = SnakeCell(tmp[i - 1].0)
        }
    }

    fn get_next_cell(&self, direction: &Direction) -> SnakeCell {
        let snake_idx = self.snake_head();
        let row = snake_idx / self.width;

        let next_cell_idx = match direction {
            Direction::Up => (snake_idx - self.width) % self.size,
            Direction::Right => (row * self.width) + (snake_idx + 1) % self.width,
            Direction::Down => (snake_idx + self.width) % self.size,
            Direction::Left => (row * self.width) + (snake_idx - 1) % self.width,
        };

        SnakeCell(next_cell_idx)
    }

    pub fn change_snake_direction(&mut self, direction: Direction) {
        let next_cell = self.get_next_cell(&direction);

        if self.snake.body[1].0 == next_cell.0 {
            return;
        }
        self.next_cell = Some(next_cell);
        self.snake.direction = direction;
    }

    pub fn width(&self) -> usize {
        self.width
    }

    pub fn snake_head(&self) -> usize {
        self.snake.body[0].0
    }

    pub fn snake_length(&self) -> usize {
        self.snake.body.len()
    }

    // returns a raw pointer (*const) to the first snake cell in the body
    pub fn snake_cells(&self) -> *const SnakeCell {
        self.snake.body.as_ptr()
    }

    //  this doesnt work in js, can't return a reference in wasm
    //     pub fn snake_cells(&self) -> &Vec<SnakeCell> {
    //         &self.snake.body
    //     }
}
