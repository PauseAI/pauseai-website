type Task<T> = () => Promise<T> | T

export class TaskQueue {
	private queue: Array<() => Promise<void>> = []
	private interval: number
	private isRunning: boolean = false

	constructor(interval: number = 1000) {
		this.interval = interval
	}

	// Method to add a new task to the queue
	public addTask<T>(task: Task<T>): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			const wrappedTask = async () => {
				try {
					const result = await task()
					resolve(result)
				} catch (error) {
					reject(error)
				}
			}

			this.queue.push(wrappedTask)

			// Start execution if not already running
			if (!this.isRunning) {
				this.startExecution()
			}
		})
	}

	// Method to start executing tasks
	private async startExecution() {
		this.isRunning = true

		while (this.queue.length > 0) {
			const task = this.queue.shift()
			if (task) {
				await task() // Execute the task and await its completion
			}

			// Always wait for the configured interval before processing the next task
			await new Promise((resolve) => setTimeout(resolve, this.interval))
		}

		this.isRunning = false
	}
}
