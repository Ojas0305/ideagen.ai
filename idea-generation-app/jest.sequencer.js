const Sequencer = require('@jest/test-sequencer').default

class CustomSequencer extends Sequencer {
    /**
     * Sort test to determine order of execution
     * Provide a stable sort to ensure consistent ordering
     */
    sort(tests) {
        // Create a copy of the array to avoid mutating the original
        const copyTests = Array.from(tests)

        // Sort tests by file path to ensure consistent ordering
        return copyTests.sort((testA, testB) => {
            const pathA = testA.path
            const pathB = testB.path

            // Integration tests should run after unit tests
            if (pathA.includes('integration') && !pathB.includes('integration')) {
                return 1
            }
            if (!pathA.includes('integration') && pathB.includes('integration')) {
                return -1
            }

            // Otherwise, sort alphabetically
            return pathA.localeCompare(pathB)
        })
    }
}

module.exports = CustomSequencer 