return {
	{
		"xixiaofinland/sf.nvim",
		ft = { "apex", "visualforce", "javascript", "html" },
		cmd = { "SfPushMetadata", "SfRetrieveMetadata", "SfRunAllTestsInCurrentFile", "SfSetTargetOrg" },
		dependencies = { "nvim-lua/plenary.nvim" },
		config = function()
			require("sf").setup({})
			local map = vim.keymap.set
			map("n", "<leader>sp", "<cmd>SfPushMetadata<cr>", { desc = "SF: push metadata" })
			map("n", "<leader>sr", "<cmd>SfRetrieveMetadata<cr>", { desc = "SF: retrieve metadata" })
			map("n", "<leader>st", "<cmd>SfRunAllTestsInCurrentFile<cr>", { desc = "SF: run tests in file" })
			map("n", "<leader>so", "<cmd>SfSetTargetOrg<cr>", { desc = "SF: set target org" })
		end,
	},
}
